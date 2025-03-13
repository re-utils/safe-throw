/**
 * @module Running async flow
 */

import { isErr, type Err } from '.';

/**
 * Unwrap a type
 */
export type Unwrap<T> = Exclude<Awaited<T>, Err>;

/**
 * Unwrap a type list
 */
export type UnwrapAll<T extends any[]> = T extends [infer A, ...infer B]
  ? [Unwrap<A>, ...UnwrapAll<B>]
  : [];

/**
 * Unwrap a type list and merge values into an union
 */
export type UnwrapAny<T extends any[]> = T extends [infer A, ...infer B]
  ? [Unwrap<A>, ...UnwrapAll<B>]
  : [];

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
export const unwrap = function* <T>(p: T): Generator<Unwrap<T>, Unwrap<T>> {
  // @ts-expect-error Unwrap promise in run
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
export const all = function* <T extends any[]>(p: T): Generator<UnwrapAll<T>, UnwrapAll<T>> {
  // @ts-expect-error Unwrap promise in run
  return yield Promise.all(p).then(unwrapResolvedAll);
};

/**
 * Unwrap the first promise that resolves
 * @param p
 */
export const race = function* <T extends any[]>(p: T): Generator<UnwrapAny<T>, UnwrapAny<T>> {
  // @ts-expect-error Unwrap promise in run
  return yield Promise.race(p);
};
