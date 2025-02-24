import { isErr, taggedErr, type Err, type InferResult, type InitTaggedErr, type TaggedErr } from '.';

/**
 * The tag of native errors
 */
export const nativeErrTag: unique symbol = Symbol();

/**
 * Describe a native error
 */
type NativeErr = TaggedErr<typeof nativeErrTag>;

/**
 * The native error constructor
 */
export const nativeErr: InitTaggedErr<typeof nativeErrTag> = taggedErr(nativeErrTag);

/**
 * Make the payload resolves to `undefined` when it throws
 * @param p
 */
export const ignoreErr = <const T>(p: T): InferResult<T> | undefined => {
  if (!isErr(p)) return p as any;
};

/**
 * Catch promise error safely
 * @param p
 */
export const tryPromise = <const T>(
  p: Promise<T>
): Promise<T | NativeErr> => p.catch(nativeErr);

/**
 * Try to run a sync function
 * @param fn
 * @param args - The arguments to put in the function
 * @returns return the result or an error
 */
export const syncTry = <
  const T extends any[],
  const R
>(fn: (...args: T) => R, ...args: T): R | Err => {
  try {
    return fn(...args);
  } catch (e) {
    return nativeErr(e);
  }
};

/**
 * Try to run an async function
 * @param fn
 * @param args - The arguments to put in the function
 * @returns return the result or an error
 */
export const asyncTry = <
  const T extends any[],
  const R
>(fn: (...args: T) => Promise<R>, ...args: T): Promise<R | Err> => fn(...args).catch(nativeErr);
