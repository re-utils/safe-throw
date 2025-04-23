/**
 * @module Native error handling
 */

import { taggedErr, taggedWith, type InitTaggedErr, type TaggedErr } from './index.js';

/**
 * The tag of native errors
 */
export const errTag: unique symbol = [] as any;

/**
 * Describe a native error
 */
export type Err<P = unknown> = TaggedErr<typeof errTag, P>;

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
export const tryPromise = <const T, const P>(
  p: Promise<T>
): Promise<T | Err<P>> => p.catch(err);

/**
 * Wrap an async function and return thrown error as a `nativeErr`
 * @param fn
 */
export const syncTry = <
  const T extends any[],
  const R,
  const P
>(fn: (...args: T) => R): (...args: T) => R | Err<P> => (...args) => {
  try {
    return fn(...args);
  } catch (e) {
    return err(e) as any;
  }
};

/**
 * Wrap an async function and return thrown error as a `nativeErr`
 * @param fn
 */
export const asyncTry = <
  const T extends any[],
  const R,
  const P
>(fn: (...args: T) => Promise<R>): (...args: T) => Promise<R | Err<P>> => (...args) => tryPromise<R, P>(fn(...args));

/**
 * Run fetch without throwing errors
 */
export const request = asyncTry(fetch) as (
  (...args: Parameters<typeof fetch>) =>
  ReturnType<typeof fetch> | Promise<Err<DOMException | TypeError>>
);
