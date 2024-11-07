/* eslint-disable @typescript-eslint/no-explicit-any */
import { Context, Data, Effect, Layer } from 'effect';

export class QueryError extends Data.TaggedError('QueryError')<{
  message: string;
}> {}

interface QueryImpl {
  get: <T>(
    route: string,
    headers?: Record<string, unknown>,
  ) => Effect.Effect<T, QueryError, never>;
}

export class Query extends Context.Tag('Query')<Query, QueryImpl>() {
  static readonly Live = Layer.succeed(this, {
    get: (url, headers) =>
      Effect.tryPromise({
        try: () =>
          fetch(`${url}`, {
            method: 'get',
            headers: headers as any,
          }).then(x => x.json() as any),
        catch: () =>
          new QueryError({
            message: `Не удалось выполнить запрос к ${url}`,
          }),
      }),
  });
}
