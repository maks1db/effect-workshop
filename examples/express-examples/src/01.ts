import { flow, pipe } from 'effect';

const log = (val: unknown) => console.log(`Результат: ${val}`);

const add = (a: number) => (b: number) => a + b;
const add10 = add(10);

pipe(2, add10, add(5), log); // 17

const calcWithLog = flow(add10, add(5), log);
calcWithLog(3); // 18
