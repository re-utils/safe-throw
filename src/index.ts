/**
 * @module
 * Error initialization and checking module
 */
const errorSymbol: unique symbol = Symbol();

/**
 * Describe an error
 */
export interface Err<T = unknown> {
  // eslint-disable-next-line
  0: typeof errorSymbol,
  // eslint-disable-next-line
  1: T
}

/**
 * Describe a tagged error
 */
export interface TaggedErr<Tag = unknown, T = unknown> extends Err<T> {
  // eslint-disable-next-line
  2: Tag
}

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
 * Check whether input is an error
 * @param t
 */
export const isErr = (t: any): t is Err => Array.isArray(t) && t[0] === errorSymbol;

/**
 * Create an error from the payload
 * @param payload
 */
export const err = <const T>(payload: T): Err<T> => [errorSymbol, payload];

/**
 * Return the payload of an error
 * @param e - The error to extract the payload
 */
export const payload = <const T>(e: Err<T>): T => e[1];

/**
 * Check if an error is tagged
 * @param e - The error to be checked
 */
// @ts-expect-error Don't provide the info on the type
export const tagged = (e: Err): e is TaggedErr => e.length > 2;

/**
 * Check if an error is tagged with a specific tag
 * @param tag - The tag to check with
 * @param e - The error to be checked
 */
export const taggedWith = <const T>(tag: T, e: TaggedErr): e is TaggedErr<T> => e[2] === tag;

/**
 * Get the tag of a tagged error union
 * @param e - The tagged error union
 */
export const tag = <const T>(e: TaggedErr<T>): T => e[2];

/**
 * Create a tagged error constructor
 * @param t - The error tag
 */
export const taggedErr = <const T>(t: T): InitTaggedErr<T> => (p) => [errorSymbol, p, t];

/**
 * Describe an unexpected error
 */
export class UnexpectedError extends Error {
  val: unknown;
  constructor(p: unknown) {
    super('Unexpected Error');
    this.val = p;
  }
}

/**
 * Unwrap a payload
 * @param p - The payload to unwrap
 * @throws When the payload is an error
 */
export const unwrapErr = <const T>(p: T): InferResult<T> => {
  // Likely to happen
  if (!isErr(p)) return p as any;
  throw new UnexpectedError(p[1]);
};

/**
 * Unwrap a payload, resolves to the fallback value when payload is an error
 * @param p - The value to unwrap
 * @param f - The fallback value
 */
export const unwrapOr = <
  const T,
  const F = undefined
>(p: T, f?: F): InferResult<T> | F => isErr(p) ? f : p as any;
