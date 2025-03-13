/**
 * @module Running async flow
 */

import { isErr, type Err } from '.';

/**
 * Unwrap a type
 */
export type Unwrap<T> = Exclude<Awaited<T>, Err>;

/**
 * Unwrap to an error
 */
export type UnwrapErr<T> = Awaited<T> & Err;

type ListResult<T extends any[], Result extends any[] = [], Error = never> = T extends [infer A, ...infer B]
  ? ListResult<B, [...Result, Unwrap<A>], UnwrapErr<A>>
  : Result | Error;

/**
 * Describe a generator that unwrap the error type
 */
export type UnwrapGenerator<T> = Generator<T, Unwrap<T>>;

/**
 * Describe a flow runner
 */
export type Runner = <T, TReturn>(g: Generator<T, TReturn>) => Promise<T | TReturn>;

/**
 * Run a flow. You can use this to run a generator like a fiber
 * @param g - The flow to run
 */
export const run: Runner = async (g) => {
  let t = g.next();

  while (!t.done) {
    const v = await t.value;
    if (isErr(v)) return v;
    t = g.next(v);
  }

  return t.value;
};

/**
 * Unwrap a value
 * @param p
 */
export const unwrap = function* <T>(p: T): UnwrapGenerator<T> {
  return yield p;
};

// Avoid async generators
const unwrapResolvedAll = (arr: any[]): any => {
  for (let i = 0; i < arr.length; i++) {
    if (isErr(arr[i]))
      return arr[i];
  }

  return arr;
};

/**
 * Unwrap all promises concurrently
 * @param p
 */
export const all = function* <T extends any[]>(p: T): UnwrapGenerator<ListResult<T>> {
  // @ts-expect-error Unwrap promise in run
  return yield Promise.all(p).then(unwrapResolvedAll);
};

/**
 * Unwrap the first promise that resolves
 * @param p
 */
export const race = function* <T extends any[]>(p: T): UnwrapGenerator<Awaited<T[number]>> {
  // @ts-expect-error Unwrap promise in run
  return yield Promise.race(p);
};
