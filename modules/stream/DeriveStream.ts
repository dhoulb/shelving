import { Deriver, derive, dispatchError, isAsync, Subscribable, Observer, AnyObserver, ObserverType } from "../util/index.js";
import { AbstractStream } from "./AbstractStream.js";
import { Stream } from "./Stream.js";

/** Stream that derives its next value using a deriver. */
export class DeriveStream<I, O> extends AbstractStream<I, O> {
	private _deriver: Deriver<I, O | Promise<O>>;
	constructor(deriver: Deriver<I, O | Promise<O>>) {
		super();
		this._deriver = deriver;
	}

	// Override to derive any received values using the `Deriver` function and send them to the `DISPATCH_DERIVED()` method.
	protected override _derive(value: I): void {
		try {
			const derived = derive(value, this._deriver);
			if (isAsync(derived)) derived.then(v => this._dispatch(v)).catch(thrown => this.error(thrown));
			else this._dispatch(derived);
		} catch (thrown) {
			dispatchError(thrown, this);
		}
	}
}

/** Derive from a source to a new or existing stream using a deriver. */
export function deriveStream<I, O extends AnyObserver>(source: Subscribable<I>, deriver: Deriver<I, ObserverType<O> | Promise<ObserverType<O>>>, target: O): O;
export function deriveStream<I, O>(source: Subscribable<I>, deriver: Deriver<I, O | Promise<O>>): Stream<O>;
export function deriveStream<I, O>(source: Subscribable<I>, deriver: Deriver<I, O | Promise<O>>, target: Observer<O> = new Stream<O>()): Observer<O> {
	const middleware = new DeriveStream<I, O>(deriver);
	middleware.on(target);
	middleware.start(source);
	return target;
}
