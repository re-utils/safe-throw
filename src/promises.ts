import { isErr, type InferErr, type InferResult } from '.';

type AnyPromise = Promise<any>;
type PromiseList = AnyPromise[];

type InferAll<T extends PromiseList, Results extends any[], ErrorUnion> = T extends [Promise<infer A>, ...infer Rest extends PromiseList]
  ? InferAll<Rest, [...Results, InferResult<A>], ErrorUnion | InferErr<A>>
  : Results | ErrorUnion;

/**
 * Resolve all promises, return the values or the first error if caught
 * @param p - The promises list
 */
export const all = <const T extends PromiseList>(p: T): Promise<InferAll<T, [], never>> => {
  // Promise.withResolvers might be slower
  let res: (value: unknown) => void;
  const promise = new Promise((r) => { res = r; });

  for (
    let i = 0,
      // eslint-disable-next-line
      cb = (r: any): any => isErr(r) ? res(r) : r;
    i < p.length;
    i++
  ) p[i].then(cb);

  // @ts-expect-error Assigned with new Promise
  Promise.all(p).then(res);
  return promise as any;
};
