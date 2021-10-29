import { AsyncCatcher, AsyncDeriver, AsyncDispatcher, AsyncEmptyDispatcher, Observable, Observer, Resolvable, therive, Unsubscriber } from "../util/index.js";
import { Stream, StreamSource } from "./Stream.js";

/** Stream that derives its next value using a `Deriver` function. */
export class DeriveStream<I, O> extends Stream<I, O> implements Observer<I>, Observable<O> {
	private _deriver: AsyncDeriver<I, O>;
	constructor(deriver: AsyncDeriver<I, O>, source?: StreamSource<I>) {
		super(source);
		this._deriver = deriver;
	}
	override next(value: Resolvable<I>) {
		super.next(value);
	}
	override subscribe(next: Observer<O> | AsyncDispatcher<O>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return super.subscribe(next, error, complete);
	}
	protected override _deriveNext(value: I) {
		therive<I, O, "_dispatchNext", "error">(
			value,
			this._deriver,
			this as unknown as { _dispatchNext(v: O): void }, // Unknown cast to allow calling protected `this.dispatchNext()`
			"_dispatchNext",
			this,
			"error",
		);
	}
}
