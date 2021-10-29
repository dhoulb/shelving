import type { Observable } from "../util/index.js";
import { LimitStream } from "./LimitStream.js";

/**
 * Get a Promise that resolves to the next value issued by an observable.
 * - Internally uses a `LimitedStream` instance that unsubscribes itself after receiving one value.
 */
export const getNextValue = <T>(observable: Observable<T>): Promise<T> =>
	new Promise<T>((next, error) => new LimitStream<T, T>(1, observable).on({ next, error }));
