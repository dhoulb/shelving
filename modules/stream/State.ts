import {
	AsyncDeriver,
	LOADING,
	SKIP,
	ImmutableObject,
	Mutable,
	updateProps,
	ImmutableArray,
	ArrayType,
	swapItem,
	withoutItem,
	withItem,
	assertArray,
	assertObject,
	Resolvable,
	dispatchNext,
	Observer,
	isObservable,
	Observable,
} from "../util";
import { RequiredError } from "../errors";
import { DerivingStream, Stream } from "./Stream";
import { getNextValue } from "./helpers";

/**
 * State: a stream the retains its msot recent value and makes it available at `state.value` and `state.data`
 */
export class State<T> extends Stream<T> implements Observer<T>, Observable<T> {
	#value: T | typeof LOADING = LOADING; // Current value (may not have been fired yet).

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
		if (this.#value === LOADING) throw getNextValue(this);
		return this.#value;
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
		super(isObservable(initial) ? initial : undefined);
		if (initial instanceof State) {
			if (!initial.loading) this.next(initial.value);
		} else if (!isObservable(initial)) {
			this.next(initial);
		}
	}

	next(value: Resolvable<T | typeof LOADING>): void {
		(this as Mutable<this>).pending = false;

		if (this.closed || value === SKIP || value === this.#value) return;
		if (value instanceof Promise) {
			(this as Mutable<this>).pending = true;
			return dispatchNext(this, value);
		}

		this.#value = value;
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
		assertObject<T & ImmutableObject>(this.#value);
		this.next(updateProps<T & ImmutableObject>(this.#value, partial));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	add(item: ArrayType<T & ImmutableArray>): void {
		assertArray<T & ImmutableArray>(this.#value);
		this.next(withItem<T & ImmutableArray>(this.#value, item));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	remove(item: ArrayType<T & ImmutableArray>): void {
		assertArray<T & ImmutableArray>(this.#value);
		this.next(withoutItem<T & ImmutableArray>(this.#value, item));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	swap(oldItem: ArrayType<T & ImmutableArray>, newItem: ArrayType<T & ImmutableArray>): void {
		assertArray<T & ImmutableArray>(this.#value);
		this.next(swapItem<T & ImmutableArray>(this.#value, oldItem, newItem));
	}

	// Override `error()` to save the reason at `this.reason` and clean up.
	error(reason: Error | unknown): void {
		(this as Mutable<this>).pending = false;
		if (this.closed) (this as Mutable<this>).reason = reason;
		super.error(reason);
	}

	// Override `complete()` to clean up.
	complete(): void {
		(this as Mutable<this>).pending = false;
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
			if (this.#value !== LOADING) deriving.next(this.#value); // Send the next value to the deriving stream, which derives the new value and sends it to the derived state.
			return derived;
		} else {
			return new State<T>(this);
		}
	}
}
