import { Stream, StreamSource } from "./Stream.js";

/** Stream that takes a specified number of values from a source then completes itself. */
export class LimitStream<I, O = I> extends Stream<I, O> {
	private _remaining: number;
	constructor(num: number, source?: StreamSource<I>) {
		super(source);
		this._remaining = num;
	}
	// Override to complete when the specified number of next values have been taken.
	protected override _dispatchNext(value: O): void {
		super._dispatchNext(value);
		this._remaining--;
		if (this._remaining <= 0) this.complete();
	}
}
