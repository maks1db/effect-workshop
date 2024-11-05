/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Data, Effect, Layer } from 'effect';
import { Query } from './Query.js';
import { SideEffects } from './SideEffects.js';
import { Config } from './Config.js';
import { Storage } from './Storage.js';
import { Random } from './Random.js';

export class ClientISError extends Data.TaggedError('ClientISError')<{
  message: string;
}> {}

interface ClientISImpl {
  getISConfig: () => Effect.Effect<ConfigurationType, ClientISError, never>;
  isSignInUrl: () => Effect.Effect<boolean, never, never>;
  toRedirectUrl: () => Effect.Effect<void, never, never>;
  authorize: () => Effect.Effect<void, RangeError, never>;
  getRedirectUrl: () => Effect.Effect<string, never, never>;
  isTokenValid: (
    token: string,
    config: ConfigurationType,
  ) => Effect.Effect<boolean, never, never>;
}

export class ClientIS extends Context.Tag('ClientIS')<
  ClientIS,
  ClientISImpl
>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(
      Effect.all([Query, SideEffects, Config, Storage, Random]),
      ([query, sideEffects, config, storage, random]) => ({
        getRedirectUrl() {
          const loc = sideEffects.getLocation();

          return Effect.succeed(`${loc.pathname}${loc.search}${loc.hash}`);
        },
        toRedirectUrl: () =>
          Effect.sync(() => {
            const url = storage.getRedirectUrl();
            const loc = sideEffects.getLocation();
            if (url) {
              // @ts-ignore
              loc.href = url;
            }
          }),
        authorize: () =>
          Effect.gen(function* () {
            const loc = sideEffects.getLocation();
            const redirectUri = `${loc.origin}/${config.signInUri}`;
            const state = yield* random.get();
            const nonce = yield* random.get();

            // eslint-disable-next-line max-len
            const url = `${config.host}?client_id=${config.client}&redirect_uri=${redirectUri}&response_type=id_token token&scope=openid profile email&state=${state}&nonce=${nonce}`;
            loc.href = url;
          }),
        isSignInUrl: () => {
          return Effect.succeed(
            sideEffects.getLocation().href.includes(config.signInUri),
          );
        },
        getISConfig: () =>
          query.get('/.well-known/openid-configuration').pipe(
            Effect.mapError(
              () =>
                new ClientISError({
                  message: 'Не удалось получить конфигурацию IS',
                }),
            ),
            Effect.map(d => d as ConfigurationType),
          ),

        isTokenValid(token, configIS) {
          return query
            .get(`${config.host}/${configIS.userinfo_endpoint}`, {
              Authorization: `Bearer ${token}`,
            })
            .pipe(
              Effect.match({
                onFailure: () => false,
                onSuccess: () => true,
              }),
            );
        },
      }),
    ),
  );
}

export const ClientISLive = Layer.mergeAll(
  Storage.Live,
  Query.Live,
  Random.Live,
);

export type ConfigurationType = {
  issuer: string;
  jwks_uri: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  end_session_endpoint: string;
  check_session_iframe: string;
  revocation_endpoint: string;
  introspection_endpoint: string;
  device_authorization_endpoint: string;
};
