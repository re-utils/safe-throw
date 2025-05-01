/**
 * @module Basic error handling
 */

// Limit type hint as much as possible
type NoProp = Readonly<Record<string | number | symbol, never>>;

// Make tags unique
declare const sym: unique symbol;

const errorTag: NoProp & { readonly [sym]: unique symbol } = [] as any;

/**
 * The tag of native errors
 */
export const nativeTag: NoProp & { readonly [sym]: unique symbol } = [] as any;

// Don't expose error props
declare const payloadSym: unique symbol;
declare const tagSym: unique symbol;

/**
 * Describe an error
 */
export type Err<T = unknown> = NoProp & { [payloadSym]: T };

/**
 * Describe a tagged error
 */
export type TaggedErr<Tag = unknown, T = unknown> = Err<T> & { [tagSym]: Tag };

/**
 * Describe a native error
 */
export type NativeErr<P = unknown> = TaggedErr<typeof nativeTag, P>;

/**
 * Describe a tagged error constructor
 */
export type InitTaggedErr<T> = <const P>(payload: P) => TaggedErr<T, P>;

/**
 * Infer the result type from a type
 */
export type InferResult<T> = Exclude<T, Err>;

/**
 * Infer the error type from the error type
 */
export type InferErr<T> = Extract<T, Err>;

/**
 * Infer the error payload type
 */
export type InferPayload<T extends Err> = T[typeof payloadSym];

/**
 * Infer the error tag type
 */
export type InferTag<T extends TaggedErr> = T[typeof tagSym];

/**
 * Check whether input is an error
 * @param t
 */
export const isErr = (t: any): t is Err =>
  Array.isArray(t) && t[0] === errorTag;

/**
 * Create an error from the payload
 * @param payload
 */
export const err = <const T>(payload: T): Err<T> => [errorTag, payload] as any;

/**
 * Return the payload of an error
 * @param e - The error to extract the payload
 */
export const payload = <const T>(e: Err<T>): T => e[1];

/**
 * Check if an error is tagged
 * @param e - The error to be checked
 */
export const tagged = <const T>(e: Err<T>): e is TaggedErr<any, T> =>
  e.length > 2;

/**
 * Check if an error is tagged with a specific tag
 * @param tag - The tag to check with
 * @param e - The error to be checked
 */
export const taggedWith = <const T, const P>(
  tag: T,
  e: Err<P>,
): e is TaggedErr<T, P> => tagged(e) && e[2] === tag;

/**
 * Get the tag of a tagged error union
 * @param e - The tagged error union
 */
export const tag = <const T>(e: TaggedErr<T>): T => e[2];

/**
 * Create a tagged error constructor
 * @param t - The error tag
 */
export const taggedErr =
  <const T>(t: T): InitTaggedErr<T> =>
  (p) =>
    [errorTag, p, t] as any;

/**
 * The native error constructor
 */
export const nativeErr: InitTaggedErr<typeof nativeTag> = (p) =>
  [errorTag, p, nativeTag] as any;

/**
 * Check if an error is a native error
 * @param e
 */
export const isNativeErr = <const T>(e: Err<T>): e is NativeErr<T> =>
  taggedWith(nativeTag, e);

/**
 * Catch promise error safely
 * @param p
 */
export const promiseTry = <const T>(p: Promise<T>): Promise<T | NativeErr> =>
  p.catch(nativeErr);

/**
 * Wrap a sync function and return thrown error as a native error
 * @param fn
 */
export const syncTry = <const P, const F extends (...args: any[]) => any>(
  fn: F,
): F & ((...args: Parameters<F>) => NativeErr<P>) =>
  ((...args) => {
    try {
      return fn(...args);
    } catch (e) {
      return nativeErr(e) as any;
    }
  }) as F;

/**
 * Wrap an async function and return thrown error as a `NativeErr`
 * @param fn
 */
export const asyncTry = <
  const P,
  const F extends (...args: any[]) => Promise<any>,
>(
  fn: F,
): F | ((...args: Parameters<F>) => Promise<NativeErr<P>>) =>
  ((...args) => promiseTry(fn(...args))) as F;

/**
 * Fetch and return error as a `NativeErr`
 */
export const request: (
  input: string | Request | URL,
  init?: RequestInit | undefined,
) => Promise<Response | NativeErr<DOMException | TypeError>> = asyncTry(fetch);
