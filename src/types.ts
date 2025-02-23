declare const TYPE_ERR: unique symbol;

export interface TypeErr<T> {
  [TYPE_ERR]: T;
}
