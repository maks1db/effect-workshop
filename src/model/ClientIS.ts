/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/naming-convention */
import { Data, Effect } from 'effect';
import { Query } from './Query.js';
import { SideEffects } from './SideEffects.js';
import { Config } from './Config.js';
import { Storage } from './Storage.js';

import { ConfigurationType } from './types.js';
import { Url } from './Url.js';

export class ClientISError extends Data.TaggedError('ClientISError')<{
  message: string;
}> {}

export class ClientIS extends Effect.Service<ClientIS>()('ClientIS', {
  effect: Effect.map(
    Effect.all([Query, SideEffects, Config, Storage, Url]),
    ([query, sideEffects, appConfig, storage, url]) => {
      class __ClientIS {
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
  dependencies: [Url.Default, Query.Default, Storage.Default],
}) {}
