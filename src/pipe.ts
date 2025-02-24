/**
 * @module
 * Pipelining for sync and async functions
 */
import { isErr, type InferErr, type InferResult } from '.';
import isAsync from './utils/isAsync';

/**
 * Describe a pipeline
 */
export interface Pipe<Input extends any[], Output> {
  /**
   * Whether the pipeline is asynchronous
   * @internal
   */
  x: boolean;

  /**
   * The composed function
   * @param args
   */
  fn: (...args: Input) => Output;

  /**
   * Run a function with the current value then return the original value
   * @param fn
   */
  tap: (fn: (a: InferResult<Output extends Promise<infer Result> ? Result : Output>) => any) => this;

  /**
   * Recieves the input of the previous function and produce an output
   * @param fn
   */
  pipe: Output extends Promise<infer Result>
    ? <O>(fn: (a: InferResult<Result>) => O) => Pipe<Input, Promise<O | InferErr<Result>>>
    : <O>(fn: (a: InferResult<Output>) => O) => Pipe<Input, O | InferErr<Output>>;
}

const pipeProto: Pipe<any, any> = {
  x: false,

  fn: null as any,
  tap(fn: (arg: any) => any) {
    const prev = this.fn;
    const fnAsync = isAsync(fn);

    if (this.x) {
      // If the scope is async
      this.fn = fnAsync ?
        async (a) => {
          a = await prev(a);
          if (!isErr(a)) await fn(a);
          return a;
        }
        : async (a) => {
          a = await prev(a);
          if (!isErr(a)) fn(a);
          return a;
        };
    } else {
      // If chain is not async
      this.fn = fnAsync ?
        async (a) => {
          a = prev(a);
          if (!isErr(a)) await fn(a);
          return a;
        }
        : (a) => {
          a = prev(a);
          if (!isErr(a)) fn(a);
          return a;
        };
      this.x = fnAsync;
    }

    return this as any;
  },
  pipe(fn: (arg: any) => any) {
    const prev = this.fn;

    if (this.x) {
      // If the scope is async
      this.fn = async (a) => {
        a = await prev(a);
        return isErr(a) ? a : fn(a);
      };
    } else {
      // If chain is not async
      this.fn = (a) => {
        a = prev(a);
        return isErr(a) ? a : fn(a);
      };
      this.x = isAsync(fn);
    }

    return this as any;
  }
};

/**
 * Create a pipeline that returns the result or the first error caught
 * Don't use this for startup code.
 * @param fn - The first function of the pipeline
 */
export const init = <
  const I extends [] | [any],
  const O
>(fn: (...a: I) => O): Pipe<I, O> => {
  const o = Object.create(pipeProto) as typeof pipeProto;
  o.fn = fn;
  return o;
};
