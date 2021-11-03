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
		super._dispatch(value);
		this._remaining--;
		if (this._remaining <= 0) this.complete();
	}
}
