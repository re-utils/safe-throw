/**
 * @module Retrying utilities
 */

import { isErr } from '.';

/**
 * Create a synchronous retrier for a function
 * @param fn
 * @param state - The initialization function for the retry state
 * @param until - The function to check whether to stop retrying
 */
export const run = <
  Args extends any[],
  State, Result
>(
  fn: (...args: Args) => Result,
  state: (...args: Args) => State,
  until: (state: State, res: Result) => boolean
): (...args: Args) => Result => (...args) => {
  for (let res, s = state(...args); ;) if (until(s, res = fn(...args))) return res;
};

/**
 * Create an asynchronous retrier for a function
 * @param fn
 * @param state - The initialization function for the retry state
 * @param until - The function to check whether to stop retrying
 */
export const runAsync = <
  Args extends any[],
  State, Result
>(
  fn: (...args: Args) => Result,
  state: (...args: Args) => State,
  until: (state: State, res: Result) => Promise<boolean> | boolean
): (...args: Args) => Promise<Awaited<Result>> => async (...args) => {
  for (let res, s = state(...args); ;) if (await until(s, res = await fn(...args))) return res as any;
};

/**
 * Retry a synchronous function n times until it doesn't return an error
 * @param n
 * @param fn
 */
export const repeat = <Args extends any[], Result>(
  n: number,
  fn: (...args: Args) => Result
): (...args: Args) => Result => (...args) => {
  for (let res, i = 1; ;) {
    res = fn(...args);
    if (i++ > n || !isErr(res)) return res;
  }
};

/**
 * Retry a function n times until it doesn't return an error
 * @param n
 * @param fn
 */
export const repeatAsync = <Args extends any[], Result>(
  n: number,
  fn: (...args: Args) => Result
): (...args: Args) => Promise<Awaited<Result>> => async (...args) => {
  for (let res, i = 1; ;) {
    res = await fn(...args);
    if (i++ > n || !isErr(res)) return res as any;
  }
};

/**
 * Retry a synchronous function until a condition is met
 * @param pass - The function to check whether to stop retrying
 * @param fn
 */
export const until = <Args extends any[], Result>(
  pass: (res: NoInfer<Result>) => boolean,
  fn: (...args: Args) => Result
): (...args: Args) => Result => (...args) => {
  for (let res; ;) if (pass(res = fn(...args))) return res;
};

/**
 * Retry an asynchronous function until a condition is met
 * @param pass - The function to check whether to stop retrying
 * @param fn
 */
export const untilAsync = <Args extends any[], Result>(
  pass: (res: NoInfer<Result>) => boolean | Promise<boolean>,
  fn: (...args: Args) => Result
): (...args: Args) => Promise<Awaited<Result>> => async (...args) => {
  for (let res; ;) if (await pass(res = await fn(...args))) return res as any;
};
