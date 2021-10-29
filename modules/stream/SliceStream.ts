import { dispatchNext } from "../util/index.js";
import { Stream, StreamSource } from "./Stream.js";

/** Stream that only calls a specified slice of its subscribers (not all of them!) */
export class SliceStream<I, O = I> extends Stream<I, O> {
	private _start: number;
	private _end: number | undefined;
	constructor(start: number, end: number | undefined = undefined, source?: StreamSource<I>) {
		super(source);
		this._start = start;
		this._end = end;
	}
	// Override to dispatch only to a slice of the subscribers.
	protected override _dispatchNext(value: O): void {
		for (const subscriber of this._subscribers.slice(this._start, this._end)) dispatchNext(subscriber, value);
	}
}
