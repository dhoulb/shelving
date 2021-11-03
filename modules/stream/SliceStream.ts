import { dispatchNext } from "../util/index.js";
import { Stream } from "./Stream.js";

/** Stream that only calls a specified slice of its subscribers (not all of them!) */
export class SliceStream<T> extends Stream<T> {
	private _start: number;
	private _end: number | undefined;
	constructor(start: number, end: number | undefined = undefined) {
		super();
		this._start = start;
		this._end = end;
	}
	// Override to dispatch only to a slice of the subscribers.
	protected override _dispatch(value: T): void {
		for (const subscriber of this._subscribers.slice(this._start, this._end)) dispatchNext(subscriber, value);
	}
}
