import { Context, Data, Effect, Layer } from 'effect';
import { Config } from './Config.js';

export class QueryError extends Data.TaggedError('QueryError')<{
  message: string;
}> {}

interface QueryImpl {
  get: (
    route: string,
    headers?: Record<string, unknown>,
  ) => Effect.Effect<unknown, QueryError, never>;
}

export class Query extends Context.Tag('Config')<Query, QueryImpl>() {
  static readonly Live = Layer.effect(
    this,
    Effect.map(Config, config => ({
      get: (route, headers) =>
        Effect.tryPromise({
          try: () =>
            fetch(`${config.host}/`, {
              method: 'get',
              headers: headers as any,
            }),
          catch: () =>
            new QueryError({
              message: `Не удалось выполнить запрос к ${route}`,
            }),
        }).pipe(Effect.map(x => x.json())),
    })),
  );
}
