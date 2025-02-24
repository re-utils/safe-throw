/**
 * @module
 * A fast pipeline for sync functions
 */
import { isErr, type InferErr, type InferResult } from '..';

/**
 * Describe a pipeline
 */
export interface SyncPipe<Input, Output> {
  fn: (arg: Input) => Output;
  pipe: <O>(fn: (a: InferResult<Output>) => O) => SyncPipe<Input, O | InferErr<Output>>;
}

const pipeProto: SyncPipe<any, any> = {
  fn: null as any,
  pipe(fn) {
    const f = this.fn;
    this.fn = (a) => {
      a = f(a);
      return isErr(a) ? a : fn(a);
    };
    return this as any;
  }
};

/**
 * Create a sync pipeline that returns the result or the error caught
 * @param fn - The first function of the pipeline
 */
export default <const I, const O>(fn: (a: I) => O): SyncPipe<I, O> => {
  const o = Object.create(pipeProto) as typeof pipeProto;
  o.fn = fn;
  return o;
};
