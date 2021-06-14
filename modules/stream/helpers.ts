import { Observable } from "./Observable";
import { LimitedStream } from "./Stream";

/**
 * Get a Promise that resolves to the next value issued by an observable.
 * - Internally uses a `LimitedStream` instance that unsubscribes itself after receiving one value.
 */
export const getNextValue = <T>(observable: Observable<T>): Promise<T> => new Promise<T>((next, error) => new LimitedStream(1, observable).on({ next, error }));
