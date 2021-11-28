import { Deriver, LOADING, NOERROR, Observer, dispatchNext, dispatchError, dispatchComplete, derive, getRequired } from "../util/index.js";
import { AbstractStream } from "./AbstractStream.js";
import { getNextValue } from "./LimitStream.js";

/**
 * Streamable that retains its most recent value
 * - Current value can be read at `state.value` and `state.data`
 * - States also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - States can also be in a loading state where they do not have a current value.
 *
 * @param initial The initial value for the state, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `State` instance to take the initial value from and subscribe to.
 * - To set the state to be loading, use the `LOADING` constant or a `Promise` value.
 * - To set the state to an explicit value, use that value or another `State` instance with a value.
 * */
export abstract class AbstractState<I, O> extends AbstractStream<I | typeof LOADING, O> {
	protected _value: O | typeof LOADING = LOADING;
	protected _reason: Error | unknown | typeof NOERROR = NOERROR;
	protected _updated: number | null = null;

	/** Date the current value was last updated (in milliseconds). */
	get updated(): number | null {
		return this._updated;
	}

	/** Age of the current value (in milliseconds). */
	get age(): number {
		return typeof this._updated === "number" ? Date.now() - this._updated : Infinity;
	}

	/** Most recently dispatched value (or throw `Promise` that resolves to the next value). */
	get value(): O {
		if (this._reason !== NOERROR) throw this._reason;
		if (this._value === LOADING) throw getNextValue(this);
		return this._value;
	}

	/** Get current required value (or throw `Promise` that resolves to the next required value). */
	get data(): Exclude<O, null | undefined> {
		if (this.reason !== NOERROR) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this).then(getRequired);
		return getRequired(this._value);
	}

	/** Is there a current value, or is it still loading. */
	get loading(): boolean {
		return this._value === LOADING;
	}

	/** Reason this state errored . */
	get reason(): Error | unknown | typeof NOERROR {
		return this._reason;
	}

	/** Apply a deriver to this state. */
	apply(deriver: Deriver<O, I>): void {
		this.next(derive(this.value, deriver));
	}

	// Override to save the reason at `this.reason` and clean up.
	override error(reason: Error | unknown): void {
		if (!this.closed) this._reason = reason;
		super.error(reason);
	}

	// Override to send the current error or value to any new subscribers.
	override on(observer: Observer<O>) {
		super.on(observer);
		if (this._reason !== NOERROR) dispatchError(this._reason, observer);
		else if (this.closed) dispatchComplete(observer);
		else if (this._value !== LOADING) dispatchNext(this.value, observer);
	}

	// Deriver must know what to do with `LOADING`
	protected abstract override _derive(value: I | typeof LOADING): void;

	// Dispatcher saves any values that are dispatched.
	protected override _dispatch(value: O | typeof LOADING) {
		this._value = value;
		if (value !== LOADING) {
			this._updated = Date.now();
			super._dispatch(value);
		} else {
			this._updated = null;
		}
	}
}
