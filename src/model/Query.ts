/* eslint-disable @typescript-eslint/no-explicit-any */
import { Data, Effect } from 'effect';

export class QueryError extends Data.TaggedError('QueryError')<{
  message: string;
}> {}

export class Query extends Effect.Service<Query>()('Query', {
  succeed: {
    get: <Type>(url: string, headers?: Record<string, unknown>) =>
      Effect.tryPromise({
        try: () =>
          fetch(`${url}`, {
            method: 'get',
            headers: headers as any,
          }).then(x => x.json() as Type),
        catch: () =>
          new QueryError({
            message: `Не удалось выполнить запрос к ${url}`,
          }),
      }),
  },
}) {}
