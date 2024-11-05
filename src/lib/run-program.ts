import { Effect, Fiber } from 'effect';

export const runProgram = <A, E>(program: Effect.Effect<A, E, never>) => {
  const fiber = Effect.runFork(program);
  return () => {
    Effect.runPromise(Fiber.interrupt(fiber));
  };
};
