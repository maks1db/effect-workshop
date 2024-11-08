/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-bitwise */

import { Data, Effect } from 'effect';

export class RandomError extends Data.TaggedError('RandomError')<{
  message: string;
}> {}

export class Random extends Effect.Service<Random>()('Random', {
  succeed: {
    get() {
      return Effect.try({
        try: () => {
          const hasCrypto = Boolean(globalThis.window?.crypto);
          const hasRandomValues =
            hasCrypto && typeof crypto.getRandomValues !== 'undefined';
          const uuid = hasRandomValues ? _cryptoUuidv4 : _uuidv4;
          return `${uuid().replace(/-/g, '')}${new Date().valueOf()}`;
        },
        catch: e =>
          new RandomError({
            message: `Возникла ошибка при генерации рандомного значения ${e}`,
          }),
      });
    },
  },
}) {}

// export class Random1 extends Context.Tag('Random')<Random, RandomImpl>() {
//   static readonly Live = Layer.succeed(this);
// }

function _cryptoUuidv4() {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (
      c ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))
    ).toString(16),
  );
}

function _uuidv4() {
  // @ts-ignore
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
    (c ^ ((Math.random() * 16) >> (c / 4))).toString(16),
  );
}
