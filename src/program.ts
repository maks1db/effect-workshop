import { Effect, Layer } from 'effect';
import { ClientIS, Cl, ClientISLive } from './model/ClientIS.js';
import { Parser } from './model/Parser.js';
import { Storage } from './model/Storage.js';
import { Events } from './model/Events.js';
import { Random } from './model/Random.js';
import { Query } from './model/Query.js';

const program = Effect.flatMap(
  Effect.all([Events, Parser]),
  ([events, parser]) =>
    Effect.gen(function* () {
      events.onProgramChangeState('pending');

      const [client, storage] = yield* Effect.all([ClientIS, Storage]);
      const isSignIn = yield* client.isSignInUrl();

      if (isSignIn) {
        return yield* parser
          .parseTokenFromHash()
          .pipe(
            Effect.tap(result =>
              Effect.all([storage.saveToken(result), client.toRedirectUrl()]),
            ),
          );
      }

      const params = yield* client.getISConfig();
      yield* client
        .getRedirectUrl()
        .pipe(Effect.flatMap(storage.setRedirectUrl));

      const token = yield* storage.getToken();
      if (token) {
        const isValid = yield* client.isTokenValid(token, params);
        if (isValid) {
          return token;
        }
      }
      yield* client.authorize();
      return null;
    }).pipe(
      Effect.flatMap(token =>
        Effect.gen(function* () {
          if (token) {
            const payload = yield* parser.parseTokenToPayload(token);

            return {
              token,
              payload,
            };
          }
          return null;
        }),
      ),

      Effect.match({
        onSuccess(value) {
          if (value) {
            events.onProgramChangeState('success');
            events.onParseToken(value.token, value.payload);
          }
        },
        onFailure(error) {
          events.onProgramChangeState('error');
          events.onError(error?.message || null);
        },
      }),
    ),
);

export const authProgram = program.pipe(
  Effect.provide(ClientIS.Live),
  Effect.provide(ClientISLive),
  Effect.provide(Parser.Live),
);
