import Result from '../src/Result';
import { Failure, Success } from '../src/Option';

const doThrow = (value: boolean): number => {
  if (value) {
    throw new Error('test');
  }
  return 0;
};

describe('Result', () => {
  test('of', () => {
    const error = new Error();
    expect(Result.of(error).toOption()).toStrictEqual({
      kind: 'failure',
      value: error,
    } as Failure<number>);
    expect(Result.of(1).toOption()).toStrictEqual({
      kind: 'success',
      value: 1,
    } as Success<number>);
    expect(Result.ofNull().get()).toBe(null);
    expect(Result.ofUndefined().get()).toBe(undefined);
  });

  describe('wrap', () => {
    test('success', () => {
      const result = Result.wrap(() => {
        return true;
      });
      expect(result.get()).toBe(true);
    });
    test('failure', () => {
      const result = Result.wrap(() => {
        throw new Error();
      });
      expect(() => result.get()).toThrow();
    });
  });

  describe('wrapAsync', () => {
    test('success', async () => {
      const result = await Result.wrapAsync(async () => {
        return 'hello world';
      });
      const mapped = result.matches({
        success: () => 'true',
        failure: () => 'false',
      });
      expect(mapped).toBe('true');
    });
    test('failure', async () => {
      const result = await Result.wrapAsync(async () => {
        throw new Error();
      });
      const mapped = result.matches({
        success: () => 'true',
        failure: () => 'false',
      });
      expect(mapped).toBe('false');
    });
  });

  test('fromOption', () => {
    const success: Success<number> = {
      kind: 'success',
      value: 1,
    };
    expect(Result.fromOption(success).get()).toBe(1);
    const failure: Failure<number> = {
      kind: 'failure',
      value: new Error(),
    };
    expect(() => Result.fromOption(failure).get()).toThrow();
    const notKnown = {
      kind: 'unknown',
      value: 1,
    } as unknown as Success<number>;
    expect(() => Result.fromOption(notKnown).get()).toThrow();
  });

  test('success', () => {
    expect(Result.wrap(() => doThrow(false)).get()).toBe(0);
    const result = Result.ofSuccess(1);
    expect(result.get()).toBe(1);
    // is
    expect(result.isSuccess()).toBe(true);
    expect(result.isFailure()).toBe(false);
    // if
    result.ifSuccess((value) => expect(value).toBe(1));
    result.ifSuccessOrFailure({
      success: (value) => expect(value).toBe(1),
      failure: (error) => {
        throw Error('should not happen');
      },
    });
    result.ifFailure((error) => () => {
      throw Error('should not happen');
    });
    // or
    expect(result.or(() => Result.ofSuccess(2)).get()).toBe(1);
    expect(result.orElse(2)).toBe(1);
    expect(result.orElseGet(() => 2)).toBe(1);
    expect(result.orNull()).toBe(1);
    expect(result.orUndefined()).toBe(1);
    // other
    expect(
      result.matches({
        success: (value) => value,
        failure: (error) => 2,
      }),
    ).toBe(1);
    expect(result.map((value) => 'new value').get()).toBe('new value');
    expect(result.flatMap((value) => 'new value')).toBe('new value');
    expect(result.toOption()).toStrictEqual({
      value: 1,
      kind: 'success',
    } as Success<number>);
  });

  test('failure', () => {
    expect(() => Result.wrap(() => doThrow(true)).get()).toThrowError();
    const error = new Error('test error');
    const result = Result.ofFailure(error);
    expect(() => result.get()).toThrow();
    // is
    expect(result.isSuccess()).toBe(false);
    expect(result.isFailure()).toBe(true);
    // if
    result.ifSuccess((value) => {
      throw new Error('should not happen');
    });
    result.ifSuccessOrFailure({
      success: (value) => {
        throw new Error('should not happen');
      },
      failure: (error) => expect(true).toBe(true),
    });
    result.ifFailure((error) => () => {
      expect(true).toBe(true);
    });
    // or
    expect(result.or(() => Result.ofSuccess(2)).get()).toBe(2);
    expect(result.orElse(2)).toBe(2);
    expect(result.orElseGet(() => 2)).toBe(2);
    expect(result.orNull()).toBe(null);
    expect(result.orUndefined()).toBe(undefined);
    // other
    expect(
      result.matches({
        success: (value) => value,
        failure: (error) => 2,
      }),
    ).toBe(2);
    expect(() => result.map((value) => 'new value').get()).toThrow();
    expect(() => result.flatMap((value) => 'new value')).toThrow();
    expect(result.toOption()).toStrictEqual({
      value: error,
      kind: 'failure',
    } as Failure<number>);
  });
});
