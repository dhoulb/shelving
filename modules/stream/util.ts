import type { Observable } from "../util/index.js";
import { LimitStream } from "./LimitStream.js";

/**
 * Get a Promise that resolves to the next value issued by an observable.
 * - Internally uses a `LimitedStream` instance that unsubscribes itself after receiving one value.
 */
export const getNextValue = <T>(observable: Observable<T>): Promise<T> =>
	new Promise<T>((next, error) => LimitStream.from(observable, new LimitStream<T>(1)).on({ next, error }));
