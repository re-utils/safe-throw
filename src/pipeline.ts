/**
 * @module
 * Pipelining functions
 */
import { isErr, type InferErr, type InferResult } from '.';

type PipeFn = (arg: any) => any;

const proto = {
  fn: null as unknown as PipeFn,
  next(fn: PipeFn) {
    const f = this.fn;
    this.fn = (a) => {
      a = f(a);
      return isErr(a) ? a : fn(a);
    };
    return this;
  }
};

/**
 * Describe a pipeline
 */
export interface Pipeline<Input, Output> {
  fn: (arg: Input) => Output;
  next: <O>(fn: (a: InferResult<Output>) => O) => Pipeline<Input, O | InferErr<Output>>;
}

/**
 * Create a pipeline that returns the result or the error caught
 * @param fn - The first function of the pipeline
 */
export default <const I, const O>(fn: (a: I) => O): Pipeline<I, O> => {
  const o = Object.create(proto) as typeof proto;
  o.fn = fn;
  return o;
};
