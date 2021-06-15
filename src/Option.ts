/**
 * An alias of algebraic, prototype-free JavaScript object which represents `Optional`.
 * Objects of this type are provided by `Optional.toOption`
 * and they can be retrieved as `Optional` by `Optional.from`.
 */
export type Option<T> = Success<T> | Failure<T>;

export interface Success<T> {
  kind: 'success';
  value: T;
}

export interface Failure<T> {
  kind: 'failure';
  value: Error;
}
