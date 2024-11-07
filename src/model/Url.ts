import { Context, Effect, Layer } from 'effect';
import { Random, RandomError } from './Random.js';
import { SideEffects } from './SideEffects.js';
import { Config } from './Config.js';

import { ConfigurationType } from './types.js';

interface UrlImpl {
  getRedirectUrl: () => Effect.Effect<string, never, never>;
  getAuthorizeUrl: (
    config: ConfigurationType,
  ) => Effect.Effect<string, RandomError, never>;
  isSignInUrl: () => Effect.Effect<boolean, never, never>;
}

export class Url extends Context.Tag('Url')<Url, UrlImpl>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(
      Effect.all([Random, SideEffects, Config]),
      ([random, sideEffects, appConfig]) => ({
        getRedirectUrl() {
          const loc = sideEffects.getLocation();
          return Effect.succeed(`${loc.pathname}${loc.search}${loc.hash}`);
        },
        isSignInUrl() {
          return Effect.succeed(
            sideEffects.getLocation().href.includes(appConfig.signInUri),
          );
        },
        getAuthorizeUrl: (config: ConfigurationType) =>
          Effect.gen(function* () {
            const loc = sideEffects.getLocation();
            const redirectUri = `${loc.origin}/${appConfig.signInUri}`;
            const state = yield* random.get();
            const nonce = yield* random.get();

            // eslint-disable-next-line max-len
            const url = `${config.authorization_endpoint}?client_id=${appConfig.client}&redirect_uri=${redirectUri}&response_type=id_token token&scope=openid profile email&state=${state}&nonce=${nonce}`;
            // loc.href = url;
            return url;
          }),
      }),
    ),
  );
}
