import { taggedErr, taggedWith, type InitTaggedErr, type TaggedErr } from '.';

/**
 * The tag of native errors
 */
export const errTag: unique symbol = Symbol();

/**
 * Describe a native error
 */
export type Err = TaggedErr<typeof errTag>;

/**
 * The native error constructor
 */
export const err: InitTaggedErr<typeof errTag> = taggedErr(errTag);

/**
 * Check if a tagged error is a native error
 * @param e
 * @returns
 */
export const isErr = (e: TaggedErr): e is Err => taggedWith(errTag, e);

/**
 * Catch promise error safely
 * @param p
 */
export const tryPromise = <const T>(
  p: Promise<T>
): Promise<T | Err> => p.catch(err);

/**
 * Wrap an async function and return thrown error as a `nativeErr`
 * @param fn
 */
export const syncTry = <
  const T extends any[],
  const R
>(fn: (...args: T) => R): (...args: T) => R | Err => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    return err(e);
  }
};

/**
 * Wrap an async function and return thrown error as a `nativeErr`
 * @param fn
 */
export const asyncTry = <
  const T extends any[],
  const R
>(fn: (...args: T) => Promise<R>): (...args: T) => Promise<R | Err> => (...args) => tryPromise(fn(...args));
