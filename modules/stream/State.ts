import { AsyncDeriver } from "../function";
import { RequiredError } from "../errors";
import { LOADING, SKIP } from "../constants";
import { ImmutableObject, Mutable, updateProps } from "../object";
import { ImmutableArray, ArrayType, swapItem, withoutItem, withItem } from "../array";
import { assertArray, assertObject } from "../assert";
import { Resolvable } from "../data";
import { dispatchNext, Observer } from "./Observer";
import { DerivingStream, Stream } from "./Stream";
import { isObservable, Observable } from "./Observable";
import { getNextValue } from "./helpers";

/**
 * State: a stream the retains its msot recent value and makes it available at `state.value` and `state.data`
 */
export class State<T> extends Stream<T> implements Observer<T>, Observable<T> {
	private _value: T | typeof LOADING = LOADING; // Current value (may not have been fired yet).

	readonly updated: number | undefined = undefined; // Time the value was last updated.
	readonly loading: boolean = true; // Whether we're currently loading or we have a value (if false, reading `state.value` will not throw).
	readonly pending: boolean = true; // Whether a new value is pending (i.e. has been
	readonly reason: Error | unknown = undefined; // The error that caused this state to close.

	/**
	 * Get current value.
	 * @throws `Error | unknown` if this state has errored.
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get value(): T {
		if (this.reason) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this);
		return this._value;
	}

	/**
	 * Get current data value.
	 * @throws RequiredError if the value is currently `undefined` or `null`
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get data(): Exclude<T, undefined> {
		const value = this.value;
		if (value === undefined) throw new RequiredError("State.data: State data does not exist");
		return value as Exclude<T, undefined>;
	}

	/** Age of the current data (in milliseconds). */
	get age(): number {
		return typeof this.updated === "number" ? Date.now() - this.updated : Infinity;
	}

	constructor(initial: State<T> | Observable<T> | Resolvable<T> | typeof LOADING) {
		super();
		if (initial instanceof State) {
			if (!initial.loading) this.next(initial.value);
			this.start(initial);
		} else if (isObservable(initial)) {
			this.start(initial);
		} else {
			this.next(initial);
		}
	}

	next(value: Resolvable<T | typeof LOADING>): void {
		(this as Mutable<this>).pending = false;

		if (this.closed || value === SKIP || value === this._value) return;
		if (value instanceof Promise) {
			(this as Mutable<this>).pending = true;
			return dispatchNext(this, value);
		}

		this._value = value;
		(this as Mutable<this>).loading = value === LOADING;
		(this as Mutable<this>).updated = Date.now();
		if (value !== LOADING) super.next(value);
	}

	/**
	 * Update properties in this State
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an object.
	 */
	update(partial: Partial<T & ImmutableObject>): void {
		assertObject<T & ImmutableObject>(this._value);
		this.next(updateProps<T & ImmutableObject>(this._value, partial));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	add(item: ArrayType<T & ImmutableArray>): void {
		assertArray<T & ImmutableArray>(this._value);
		this.next(withItem<T & ImmutableArray>(this._value, item));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	remove(item: ArrayType<T & ImmutableArray>): void {
		assertArray<T & ImmutableArray>(this._value);
		this.next(withoutItem<T & ImmutableArray>(this._value, item));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	swap(oldItem: ArrayType<T & ImmutableArray>, newItem: ArrayType<T & ImmutableArray>): void {
		assertArray<T & ImmutableArray>(this._value);
		this.next(swapItem<T & ImmutableArray>(this._value, oldItem, newItem));
	}

	// Override `error()` to save the reason at `this.reason` and clean up.
	error(reason: Error | unknown): void {
		(this as Mutable<this>).pending = false;
		this.stop();
		if (this.closed) return;
		(this as Mutable<this>).reason = reason;
		super.error(reason);
	}

	// Override `complete()` to clean up.
	complete(): void {
		(this as Mutable<this>).pending = false;
		this.stop();
		super.complete();
	}

	/**
	 * Create a new derived state from this state.
	 * - The `deriver()` function takes this state value and returns the new state value.
	 * - When this state updates, the `deriver()` function is rerun and the new state is updated.
	 *
	 * @param deriver Deriver function that does the deriving. Accepts the state value from this state and returns the new derived state value.
	 * @returns New `State` instance with a state derived from this one.
	 */
	derive(): State<T>;
	derive<TT>(deriver: AsyncDeriver<T, TT>): State<TT>;
	derive<TT>(deriver?: AsyncDeriver<T, TT>): State<T> | State<TT> {
		if (deriver) {
			const deriving = new DerivingStream(deriver, this); // New deriving stream subscribed to this.
			const derived = new State<TT>(deriving); // New derived state subscribed to the deriving stream.
			if (this._value !== LOADING) deriving.next(this._value); // Send the next value to the deriving stream, which derives the new value and sends it to the derived state.
			return derived;
		} else {
			const derived = new State<T>(this._value !== LOADING ? this._value : LOADING);
			this.on(derived);
			return derived;
		}
	}
}
