/**
 * An interface that represents respective cases of pattern matching of `Result`.
 */
export default interface Cases<T, U> {
  /**
   * A mapper that maps a payload for case of a successful result.
   */
  success: (value: T) => U;

  /**
   * A supplier that provides a value for case of a failure result.
   */
  failure: (error: Error) => U;
}
