import { Observable } from "../index.js";
import { Stream } from "./Stream.js";

/** Stream that takes a specified number of values from a source then completes itself. */
export class LimitStream<T> extends Stream<T> {
	private _remaining: number;
	constructor(num: number) {
		super();
		this._remaining = num;
	}
	// Override to complete when the specified number of next values have been taken.
	protected override _dispatch(value: T): void {
		if (this._remaining > 0) {
			this._remaining--;
			super._dispatch(value);
			if (this._remaining <= 0) this.complete();
		}
	}
}

/**
 * Get a Promise that resolves to the next value issued by an observable.
 * - Internally uses a `LimitedStream` instance that unsubscribes itself after receiving one value.
 */
export const getNextValue = <T>(observable: Observable<T>): Promise<T> =>
	new Promise<T>((next, error) => {
		const stream = new LimitStream<T>(1);
		stream.on({ next, error });
		stream.start(observable);
	});
