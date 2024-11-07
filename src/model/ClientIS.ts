/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/naming-convention */
import { Context, Data, Effect, Layer } from 'effect';
import { Query } from './Query.js';
import { SideEffects } from './SideEffects.js';
import { Config } from './Config.js';
import { Storage } from './Storage.js';
import { RandomError } from './Random.js';
import { ConfigurationType } from './types.js';
import { Url } from './Url.js';

export class ClientISError extends Data.TaggedError('ClientISError')<{
  message: string;
}> {}

interface ClientISImpl {
  getISConfig: () => Effect.Effect<ConfigurationType, ClientISError, never>;
  authorize: () => Effect.Effect<void, RandomError | ClientISError, never>;
  goToRedirectUrl: () => Effect.Effect<void, never, never>;

  isTokenValid: (token: string) => Effect.Effect<boolean, never, never>;
}

export class ClientIS extends Context.Tag('ClientIS')<
  ClientIS,
  ClientISImpl
>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(
      Effect.all([Query, SideEffects, Config, Storage, Url]),
      ([query, sideEffects, appConfig, storage, url]) => {
        class __ClientIS implements ClientISImpl {
          goToRedirectUrl() {
            return Effect.gen(function* () {
              const redirectUrl = yield* storage.getRedirectUrl();

              if (redirectUrl) {
                sideEffects.history.push(redirectUrl);
              }
            });
          }

          authorize() {
            return this.getISConfig().pipe(
              Effect.andThen(url.getAuthorizeUrl),
              Effect.andThen(authUrl => {
                const loc = sideEffects.getLocation();
                loc.href = authUrl;
              }),
            );
          }

          getISConfig() {
            return query
              .get<ConfigurationType>(
                `${appConfig.host}/.well-known/openid-configuration`,
              )
              .pipe(
                Effect.mapError(
                  () =>
                    new ClientISError({
                      message: 'Не удалось получить конфигурацию IS',
                    }),
                ),
              );
          }

          isTokenValid(token: string) {
            return this.getISConfig().pipe(
              Effect.flatMap(configIS =>
                query.get(configIS.userinfo_endpoint, {
                  Authorization: `Bearer ${token}`,
                }),
              ),
              Effect.match({
                onFailure: () => false,
                onSuccess: () => true,
              }),
            );
          }
        }

        const client = new __ClientIS();
        return client;
      },
    ),
  );
}
