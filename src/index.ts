/**
 * @module
 * Error initialization and checking module
 */
const errorSymbol: unique symbol = Symbol();

/**
 * Describe an error
 */
export interface Err<T = any> {
  // eslint-disable-next-line
  0: typeof errorSymbol,
  // eslint-disable-next-line
  1: T
}

/**
 * Infer the result type from a type
 */
export type InferResult<T> = Exclude<T, Error>;

/**
 * Infer the error type from the error type
 */
export type InferErr<T> = T & Error;

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
 * Describe an unexpected error
 */
export class UnexpectedError extends Error {
  val: unknown;
  constructor(payload: unknown) {
    super('Unexpected Error');
    this.val = payload;
  }
}

/**
 * Unwrap an error type
 * @param payload - The payload to unwrap
 * @throws
 */
export const unwrapErr = <const T>(payload: T): InferResult<T> => {
  // Likely to happen
  if (!isErr(payload)) return payload as any;
  throw new UnexpectedError(payload[1]);
};

/**
 * Make the payload resolves to `undefined` when it throws
 * @param payload
 */
export const ignoreErr = <const T>(payload: T): InferResult<T> | undefined => {
  if (!isErr(payload)) return payload as any;
};

/**
 * Catch promise error safely
 * @param payload
 */
export const tryPromise = async <const T>(payload: Promise<T>): Promise<T | Err> => payload.catch(err);

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
export const asyncTry = async <
  const T extends any[],
  const R
>(fn: (...args: T) => Promise<R>, ...args: T): Promise<R | Err> => fn(...args).catch(err);
