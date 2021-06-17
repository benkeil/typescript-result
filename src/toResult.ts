import { catchError, map } from 'rxjs/operators';
import Result from './Result';
import { Observable, of } from 'rxjs';

const toResult =
  () =>
  <T>(source: Observable<T>): Observable<Result<T>> => {
    return source.pipe(
      map((value) => Result.ofSuccess<T>(value)),
      catchError((error) => of(Result.ofFailure<T>(error))),
    );
  };

export default toResult;
