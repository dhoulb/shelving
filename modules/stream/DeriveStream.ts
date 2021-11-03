import { AsyncCatcher, AsyncDeriver, AsyncDispatcher, AsyncEmptyDispatcher, Observable, Observer, Subscribable, therive, Unsubscriber } from "../util/index.js";
import { Stream } from "./Stream.js";

/** Used to key a secret but public method. */
const DISPATCH_DERIVED = Symbol();

/**
 * Stream that derives its next value using a (possibly async) `Deriver` function.
 * @param deriver `Deriver` function that takes a value and returns its (possibly promised) derived value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class DeriveStream<I, O> extends Stream<any> implements Observer<I>, Observable<O> {
	private _deriver: AsyncDeriver<I, O>;
	constructor(deriver: AsyncDeriver<I, O>) {
		super();
		this._deriver = deriver;
	}
	// Override to only allow input type.
	override next(value: I): void {
		return super.next(value);
	}
	// Override to only allow input type.
	override start(source: Subscribable<I>): void {
		return super.start(source);
	}
	// Override to only allow output type.
	override subscribe(next: Observer<O> | AsyncDispatcher<O>, error?: AsyncCatcher, complete?: AsyncEmptyDispatcher): Unsubscriber {
		return super.subscribe(next, error, complete);
	}
	// Override to only allow output type.
	override on(observer: Observer<O>): void {
		return super.on(observer);
	}
	// Override to only allow output type.
	override off(observer: Observer<O>): void {
		return super.off(observer);
	}
	// Override to only allow output type.
	override to<S extends Observer<O>>(target: S): S {
		return Stream.from(this, target);
	}
	// Override to derive any received values using the `Deriver` function and send them to the `DISPATCH_DERIVED()` method.
	protected override _dispatch(value: I) {
		therive<I, O, typeof DISPATCH_DERIVED, "error">(value, this._deriver, this, DISPATCH_DERIVED, this, "error");
	}
	// Secret method that receives any derived values and dispatches them to any observers.
	[DISPATCH_DERIVED](value: O) {
		super._dispatch(value);
	}
}
