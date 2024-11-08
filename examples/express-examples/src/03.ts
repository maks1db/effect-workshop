import { Layer, Context, Effect } from 'effect';

interface SimpleServiceImpl {
  print: (value: unknown) => Effect.Effect<void, never, never>;
}

class SimpleService extends Context.Tag('SimpleService')<
  SimpleService,
  SimpleServiceImpl
>() {}

const SimpleServiceLive1 = Layer.succeed(SimpleService, {
  print: value => Effect.sync(() => console.log(`Значение: ${value}`)),
});

const SimpleServiceLive2 = Layer.succeed(SimpleService, {
  print: value => Effect.sync(() => console.table({ value })),
});

const program = Effect.gen(function* () {
  const service = yield* SimpleService;
  yield* service.print(12);
});

const runnable = program.pipe(Effect.provide(SimpleServiceLive2));

Effect.runSync(runnable);
