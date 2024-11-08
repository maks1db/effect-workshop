/* eslint-disable require-yield */
import { Console, Effect } from 'effect';

// 01
// const program = Effect.succeed(1);

// 02
// const program = Effect.fail(Error('Ты не прав'));

// 03
// const program = Effect.gen(function* () {
//   const result = 10 + 12;
//   return result;
// });

// 04
// const calc = (a: number, b: number) => {
//   if (b === 0) {
//     return Effect.fail(Error('Делитель не может быть равен нулю'));
//   }

//   return Effect.succeed(a / b);
// };

// const program = Effect.gen(function* () {
//   const result = yield* calc(24, 0);
//   yield* Console.log(result);
// });

// 05

// const program = Effect.gen(function* () {
//   const result = yield* calc(24, 12);
//   yield* Effect.sleep(1000);
//   yield* Console.log(result);
// });

// Effect.runPromise(program);
// Effect.runSync(program);
