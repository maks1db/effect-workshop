import { Effect } from 'effect';
import { ClientIS, ClientISLive } from './model/ClientIS.js';
import { Parser } from './model/Parser.js';
import { Storage } from './model/Storage.js';
import { Events } from './model/Events.js';

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

      const token = yield* storage.getToken();
      if (token) {
        const isValid = yield* client
          .getISConfig()
          .pipe(Effect.andThen(conf => client.isTokenValid(token, conf)));

        if (isValid) {
          return token;
        }
      }
      yield* client
        .getRedirectUrl()
        .pipe(
          Effect.andThen(storage.setRedirectUrl),
          Effect.andThen(client.getISConfig),
          Effect.andThen(client.authorize),
        );

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
          events.onError(error.message);
        },
      }),
    ),
);

export const authProgram = program.pipe(
  Effect.provide(ClientIS.Live),
  Effect.provide(ClientISLive),
  Effect.provide(Parser.Live),
);
