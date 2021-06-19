import Cases from './Cases';
import { Option } from './Option';

export default abstract class Result<I> {
  /**
   * Returns whether the result was successful or not.
   *
   * If the process was successful, be `true` , otherwise be `false`.
   */
  abstract isSuccess(): boolean;

  /**
   * Returns whether an error occur or not.
   *
   * If the process ends in a failure, be `true` , otherwise be `false`.
   * This method is negation of `Optional#isPresent`.
   */
  isFailure(): boolean {
    return !this.isSuccess();
  }

  static of<T>(value: T | Error): Result<T> {
    return value instanceof Error ? this.ofFailure(value) : this.ofSuccess(value);
  }

  static ofSuccess<T>(value: T): Result<T> {
    return new SuccessResult<T>(value);
  }

  static ofFailure<T>(error: Error): Result<T> {
    return new FailureResult<T>(error);
  }

  static ofNull(): Result<null> {
    return this.ofSuccess(null);
  }

  static ofUndefined(): Result<undefined> {
    return this.ofSuccess(undefined);
  }

  static wrap<T>(func: (...args: any[]) => T): Result<T> {
    try {
      return new SuccessResult(func());
    } catch (error) {
      return new FailureResult(error);
    }
  }

  static async wrapAsync<T>(func: (...args: any[]) => Promise<T>): Promise<Result<T>> {
    try {
      return new SuccessResult(await func());
    } catch (error) {
      return new FailureResult(error);
    }
  }

  /**
   * Force to retrieve the payload.
   * If the process was successful, returns the payload, otherwise throws the error.
   *
   * @throws {Error} if the process failed.
   */
  abstract get(): I;

  /**
   * If a payload is present, returns `this`,
   * otherwise returns an `Optional` provided by the given `supplier`.
   *
   * @param supplier a supplier
   */
  abstract or(supplier: () => Result<I>): Result<I>;

  /**
   * If a payload is present, returns the payload, otherwise returns `another`.
   *
   * @param another an another value
   */
  abstract orElse(another: I): I;

  /**
   * If a payload is present, returns the payload,
   * otherwise returns the result provided by the given `supplier`.
   *
   * @param supplier a supplier of another value
   */
  abstract orElseGet(supplier: () => I): I;

  /**
   * If a payload is present, returns the payload,
   * otherwise returns `null`.
   */
  abstract orNull(): I | null;

  /**
   * If a payload is present, returns the payload,
   * otherwise returns `undefined`.
   */
  abstract orUndefined(): I | undefined;

  abstract ifSuccess(consumer: (value: I) => void): void;

  abstract ifSuccessOrFailure(cases: Cases<I, void>): void;

  abstract ifFailure(consumer: (error: Error) => void): void;

  abstract matches<O>(cases: Cases<I, O>): O;

  abstract map<O>(supplier: (value: I) => O): Result<O>;

  abstract flatMap<O>(supplier: (value: I) => O): O;

  abstract toOption(): Option<I>;

  /**
   * Retrieve the given `option` as a Result.
   *
   * @param option an `Option` object to retrieve
   * @throws {TypeError} when the given `option` does not have a valid `kind` attribute.
   */
  static fromOption<I>(option: Option<I>): Result<I> {
    switch (option.kind) {
      case 'success':
        return Result.ofSuccess(option.value);
      case 'failure':
        return Result.ofFailure(option.value);
      default:
        throw new TypeError('The passed value was not an Option type.');
    }
  }
}

class SuccessResult<I> extends Result<I> {
  constructor(private readonly payload: I) {
    super();
  }

  isSuccess(): boolean {
    return true;
  }

  get(): I {
    return this.payload;
  }

  matches<O>(cases: Cases<I, O>): O {
    return cases.success(this.payload);
  }

  or(supplier: () => Result<I>): Result<I> {
    return this;
  }

  orElse(another: I): I {
    return this.payload;
  }

  orElseGet(supplier: () => I): I {
    return this.payload;
  }

  orNull(): I {
    return this.payload;
  }

  orUndefined(): I {
    return this.payload;
  }

  ifSuccess(consumer: (value: I) => void): void {
    consumer(this.payload);
  }

  ifSuccessOrFailure(cases: Cases<I, void>): void {
    cases.success(this.payload);
  }

  ifFailure(consumer: (error: Error) => void): void {}

  toOption(): Option<I> {
    return { kind: 'success', value: this.payload };
  }

  map<O>(mapper: (value: I) => O): Result<O> {
    return Result.of(mapper(this.payload));
  }

  flatMap<O>(mapper: (value: I) => O): O {
    return mapper(this.payload);
  }
}

class FailureResult<I> extends Result<I> {
  constructor(private readonly error: Error) {
    super();
  }

  isSuccess(): boolean {
    return false;
  }

  get(): I {
    throw this.error;
  }

  matches<O>(cases: Cases<I, O>): O {
    return cases.failure(this.error);
  }

  or(supplier: () => Result<I>): Result<I> {
    return supplier();
  }

  orElse(another: I): I {
    return another;
  }

  orElseGet(supplier: () => I): I {
    return this.orElse(supplier());
  }

  orNull(): null {
    return null;
  }

  orUndefined(): undefined {
    return undefined;
  }

  ifSuccess(consumer: (value: I) => void): void {}

  ifSuccessOrFailure(cases: Cases<I, void>): void {
    cases.failure(this.error);
  }

  ifFailure(consumer: (error: Error) => void): void {
    consumer(this.error);
  }

  toOption(): Option<I> {
    return { kind: 'failure', value: this.error };
  }

  map<O>(mapper: (value: I) => O): Result<O> {
    throw this.error;
  }

  flatMap<O>(mapper: (value: I) => O): O {
    throw this.error;
  }
}
