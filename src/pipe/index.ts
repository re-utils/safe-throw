/**
 * @module
 * Pipelining for sync and async functions
 */
import { isErr, type InferErr, type InferResult } from '..';

/**
 * Describe a pipeline
 */
export interface Pipe<Input, Output> {
  fn: (arg: Input) => Output;
  pipe: Output extends Promise<infer Result>
    ? <O>(fn: (a: InferResult<Result>) => O) => Pipe<Input, Promise<O | InferErr<Result>>>
    : <O>(fn: (a: InferResult<Output>) => O) => Pipe<Input, O | InferErr<Output>>;
}

const pipeProto: Pipe<any, any> = {
  fn: null as any,
  pipe(fn: (arg: any) => any) {
    const f = this.fn;
    const x = (a: any): any => isErr(a) ? a : fn(a);
    this.fn = (a) => {
      a = f(a);
      return a instanceof Promise ? a.then(x) : x(a);
    };
    return this as any;
  }
};

/**
 * Create a pipeline that returns the result or the error caught
 * @param fn - The first function of the pipeline
 */
export const init = <const I, const O>(fn: (a: I) => O): Pipe<I, O> => {
  const o = Object.create(pipeProto) as typeof pipeProto;
  o.fn = fn;
  return o;
};

export { default as sync } from './sync';
