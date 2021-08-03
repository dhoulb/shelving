import {
	AsyncDeriver,
	LOADING,
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
	Observer,
	isObservable,
	Observable,
	isAsync,
	getRequired,
	throwAsync,
} from "../util";
import { Stream } from "./Stream";

/**
 * State: a stream the retains its msot recent value and makes it available at `state.value` and `state.data`
 */
export class State<T> extends Stream<T | typeof LOADING, T> implements Observer<T>, Observable<T> {
	#value: T | typeof LOADING = LOADING; // Current value (may not have been fired yet).

	readonly updated: number | undefined = undefined; // Time the value was last updated.
	readonly loading: boolean = true; // Whether we're currently loading or we have a value (if false, reading `state.value` will not throw).
	readonly pending: boolean = true; // Whether a new value is pending (i.e. has been
	readonly reason: Error | unknown = undefined; // The error that caused this state to close.

	/**
	 * Get current value (synchronously).
	 * @returns Current value of this state.
	 * @throws Promise if the value is currently loading.
	 * @throws `Error | unknown` if this state has errored.
	 */
	get value(): T {
		return throwAsync(this.asyncValue);
	}

	/**
	 * Get current or next value (asynchronously).
	 * - Gets current value synchronously (if value is not still loading).
	 * - Gets next value asynchronously (if value is still loading).
	 *
	 * @returns Current value of this state (possibly promised).
	 * @throws `Error | unknown` if this state has errored.
	 */
	get asyncValue(): T | Promise<T> {
		if (this.reason) throw this.reason;
		return this.#value === LOADING ? this.nextValue : this.#value;
	}

	/**
	 * Get current required data value (synchronously).
	 * @throws Promise if the value is currently loading.
	 * @throws RequiredError if the value is currently `undefined`
	 * @throws `Error | unknown` if this state has errored.
	 */
	get data(): Exclude<T, undefined> {
		return throwAsync(this.asyncData);
	}

	/**
	 * Get current required data value (synchronously).
	 * @throws Promise if the value is currently loading.
	 * @throws RequiredError if the value is currently `undefined`
	 * @throws `Error | unknown` if this state has errored.
	 */
	get asyncData(): Exclude<T, undefined> | Promise<Exclude<T, undefined>> {
		const value = this.asyncValue;
		return isAsync(value) ? value.then(getRequired) : getRequired(value);
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
		if (isAsync(value)) (this as Mutable<this>).pending = true;
		super.next(value);
	}

	// Override `dispatchNext()` to save the current value and only dispatch non-loading values.
	protected dispatchNext(value: T | typeof LOADING): void {
		if (value === this.#value) return;
		(this as Mutable<this>).pending = false;
		this.#value = value;
		(this as Mutable<this>).loading = value === LOADING;
		(this as Mutable<this>).updated = Date.now();
		if (value !== LOADING) super.dispatchNext(value);
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

	// Override `dispatchError()` to save the reason at `this.reason` and clean up.
	protected dispatchError(reason: Error | unknown): void {
		(this as Mutable<this>).pending = false;
		(this as Mutable<this>).reason = reason;
		super.dispatchError(reason);
	}

	// Override `dispatchComplete()` to clean up.
	protected dispatchComplete(): void {
		(this as Mutable<this>).pending = false;
		super.dispatchComplete();
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
			const deriving = super.derive(deriver); // New deriving stream subscribed to this.
			const derived = new State<TT>(deriving); // New derived state subscribed to the deriving stream.
			if (this.#value !== LOADING) deriving.next(this.#value); // Send the next value to the deriving stream, which derives the new value and sends it to the derived state.
			return derived;
		} else {
			return new State<T>(this);
		}
	}
}
