/* eslint-disable consistent-return */
import { Effect, identity } from 'effect';
import { ClientIS } from './model/ClientIS.js';
import { Parser } from './model/Parser.js';
import { Storage } from './model/Storage.js';
import { Events } from './model/Events.js';
import { Url } from './model/Url.js';
import { Random } from './model/Random.js';

const mainApp = Effect.gen(function* () {
  const [client, storage, parser, url] = yield* Effect.all([
    ClientIS,
    Storage,
    Parser,
    Url,
  ]);
  const isSignIn = yield* url.isSignInUrl();

  if (isSignIn) {
    return yield* parser
      .parseTokenFromHash()
      .pipe(
        Effect.tap(result =>
          Effect.all([storage.saveToken(result), client.goToRedirectUrl()]),
        ),
      );
  }

  const token = yield* storage.getToken();
  if (token) {
    const isValid = yield* client.isTokenValid(token);

    if (isValid) {
      return token;
    }
  }

  yield* storage.setRedirectUrl();
  yield* client.authorize();
});

const program = Effect.gen(function* () {
  const [parser, events] = yield* Effect.all([Parser, Events]);
  events.onProgramChangeState('pending');

  const token = yield* mainApp.pipe(
    Effect.match({
      onFailure: e => {
        events.onError(e.message);
        events.onProgramChangeState('error');
      },
      onSuccess: identity,
    }),
  );

  if (token) {
    const payload = yield* parser.parseTokenToPayload(token);
    events.onParseToken(token, payload);
    events.onProgramChangeState('success');
  }
});

export const authProgram = program.pipe(
  Effect.provide(ClientIS.Default),
  Effect.provide(Parser.Default),
  Effect.provide(Storage.Default),
  Effect.provide(Url.Default),
  Effect.provide(Random.Default),
);
