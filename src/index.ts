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
 * Create a tagged error constructor
 * @param tag - The error tag
 */
export const taggedErr = <const T>(tag: T): <const P>(payload: P) => TaggedErr<T, P> => (p) => [errorSymbol, p, tag];

/**
 * Check if an error is tagged
 * @param e - The error to be checked
 */
// @ts-expect-error Don't provide the info on the type
export const isTagged = (e: Err): e is TaggedErr => e.length > 2;

/**
 * Get the tag of a tagged error union
 * @param e - The tagged error union
 */
export const tag = <const T>(e: TaggedErr<T>): T => e[2];

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
 * Unwrap an error type
 * @param p - The payload to unwrap
 * @throws When the payload is actually an error
 */
export const unwrapErr = <const T>(p: T): InferResult<T> => {
  // Likely to happen
  if (!isErr(p)) return p as any;
  throw new UnexpectedError(p[1]);
};

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
export const tryPromise = <const T>(p: Promise<T>): Promise<T | Err> => p.catch(err);

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
    return err(e);
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
>(fn: (...args: T) => Promise<R>, ...args: T): Promise<R | Err> => fn(...args).catch(err);
