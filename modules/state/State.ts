import { AsyncDeriver, isSubscriptor, Subscriptor, thispatch } from "../function";
import { isSubscribable, Observer, Subscribable, deriveFrom } from "../observe";
import { RequiredError } from "../errors";
import { LOADING, SKIP } from "../constants";
import { logError } from "../console";
import { ImmutableObject, Mutable, updateProps } from "../object";
import { ImmutableArray, ArrayType, swapItem, withoutItem, withItem } from "../array";
import { Stream } from "../stream";
import { assertArray, assertObject } from "../assert";
import { Resolvable } from "../data";

/**
 * State: store some global state in memory.
 *
 * Usage:
 * - Make a state with `new State(initialState)`
 * - Basic state can be retrieved with `state.value`
 * - Data state can be retrieved with `state.data` (throws a `RequiredError` if the state is currently undefined)
 * - New entire state can be set with `state.set(newState)`
 *
 * Listeners.
 * - `State` extends `Stream` instances, so behind the scenes when you call `set()`, it calls `next()` and fires any listeners.
 * - Listeners can be added with `on()` and `one()`
 *
 * Async values:
 * - Pass a promise as the initial value and it will be awaited, and when it reslves the new state will be set.
 * - Pass a promise into `state.set()` and it will be awaited, and the when it resolves the new state will be set.
 * - Note: when using Promises it's possible to create race conditions, so be careful.
 *
 * Object/array state:
 * - If state is an object, you can update its props using `state.update(partialState)`
 * - If state is an array, you can add/remove items from the array using `state.withItem(item)` and `state.withoutItem(item)` and `state.removeItem(old, new)`
 *
 * Loading state:
 * - Set the initial value to a promise or the `LOADING` symbol and its internal value will be set to loading.
 * - While internal value is a promise, calls to `state.data` and `state.value` will throw a promise
 * - Use `state.loading` to test if state is loading if you want to avoid the promise being thrown.
 * - Once a state has loaded once it cannot be set back to loading again.
 *
 * Error state:
 * - When `error()` is called the `State` is said to have an error (and will remain so until `set()` is called with a non-error value.
 * - While the `State` has an error calls to `state.value` and `state.data` will throw that error.
 */
export class State<T> extends Stream<T> implements Observer<T>, Subscribable<T> {
	/**
	 * Create a new state.
	 * - Static function so you can use it with `useLazy()` and for consistency with `State.derive()` and `Stream.take()`
	 *
	 * @param source Any of the following:
	 * - `LOADING` constant: Create a new state whose initial value is loading.
	 * - `State<X>`: Create a new state that subscribes to a source state and whose initial value is the source state's value.
	 * - `Subscribable<X>`: Create a new state that subscribes to a source and whose initial value is loading.
	 * - `Promise<X>`: Create a new state whose initial value is loading but will be set when the promise resolves.
	 * - `X` (anything else): Create a new state whose initial value is a known value.
	 */
	static create<X = undefined>(): State<X | undefined>;
	static create<X>(source: typeof LOADING | State<X> | Subscriptor<X> | Subscribable<X> | Promise<X> | X): State<X>;
	static create(source: Subscriptor<unknown> | Subscribable<unknown> | Promise<unknown> | unknown | typeof LOADING = undefined): State<unknown> {
		return new State(source);
	}

	private _value: T | typeof LOADING = LOADING; // Current value (may not have been fired yet).
	private _fired: T | typeof LOADING; // Last value that was fired (so we don't fire the same value twice in a row).

	readonly loading: boolean = true; // Whether we're currently loading or we have a value (if false, reading `state.value` will not throw).
	readonly pending: boolean = false; // Whether we have still need to call the subscribers, or not.
	readonly closing: boolean = false; // Whether we're pending to close (either through error or completion).
	readonly reason: Error | unknown = undefined; // The error that caused this state to close.
	readonly updated: number | undefined = undefined; // Time the value was last updated.

	/**
	 * Get current value.
	 * @throws `Error | unknown` if this state has errored.
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get value(): T {
		if (this.reason) throw this.reason;
		if (this._value === LOADING) throw super.promise;
		return this._value;
	}

	/**
	 * Current data value.
	 * @throws RequiredError if the value is currently `undefined` or `null`
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get data(): Exclude<T, undefined> {
		const value = this.value;
		if (value === undefined) throw new RequiredError("State.data: State data does not exist");
		return value as Exclude<T, undefined>;
	}

	/** Age of the current data in milliseconds. */
	get age(): number {
		return typeof this.updated === "number" ? Date.now() - this.updated : Infinity;
	}

	// Protected to encourage `State.create()`
	protected constructor(source: Subscriptor<T> | Subscribable<T> | Promise<T | typeof SKIP> | T | typeof SKIP | typeof LOADING) {
		super(isSubscribable(source) || isSubscriptor(source) ? source : undefined);
		if (isSubscribable(source) || isSubscriptor(source)) {
			// If source is a State, subscribe it.
			if (source instanceof State && !source.loading) void this.next(source.value);
		} else if (source !== LOADING && source !== SKIP) {
			// If source is a value, set it.
			void this.next(source);
		}

		// Set fired to value.
		// If value is set synchronously somewhere in `constructor()`, `next()` listeners won't be called with the initial value at the end of the tick.
		this._fired = this._value;
	}

	next(value: Resolvable<T | typeof LOADING>): void {
		if (value === SKIP || this.closing) return;
		if (value instanceof Promise) return thispatch<T | typeof LOADING, "next", "error">(this, "next", value, this, "error");

		this._value = value;
		(this as Mutable<this>).loading = value === LOADING;
		(this as Mutable<this>).updated = Date.now();
		(this as Mutable<this>).pending = true;
		Promise.resolve().then(this._fire, logError);
	}

	error(reason: Error | unknown): void {
		if (this.closing) return;
		if (reason instanceof Promise) return thispatch(this, "error", reason);

		(this as Mutable<this>).reason = reason;
		(this as Mutable<this>).closing = true;
		(this as Mutable<this>).pending = true;
		Promise.resolve().then(this._fire, logError);
	}

	complete(): void {
		if (this.closing) return;

		(this as Mutable<this>).closing = true;
		(this as Mutable<this>).pending = true;
		Promise.resolve().then(this._fire, logError);
	}

	// Run at the end of a tick to call listeners.
	private _fire = (): void => {
		// Don't tick twice.
		if (!this.pending) return;
		(this as Mutable<this>).pending = false;

		// Call the subscribers.
		if (this.reason !== undefined) {
			// If there's an error call `error()`
			super.error(this.reason);
		} else {
			// Otherwise call `next()` and possibly `complete()`
			if (this._value !== this._fired && this._value !== LOADING) {
				this._fired = this._value;
				super.next(this._value);
			}
			if (this.closing) super.complete();
		}
	};

	/**
	 * Set a new value for this state.
	 * - Listeners will fire (if value is different).
	 * - If value is a Promise, it's awaited and set after it value resolves.
	 * - Same as `next()` but with grammar that makes more sense for a state.
	 */
	set(value: Resolvable<T>): void {
		this.next(value);
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
			const state = new State<TT>(this._value !== LOADING ? deriver(this._value) : this._value);
			deriveFrom(this, deriver, state);
			return state;
		} else {
			return new State<T>(this);
		}
	}

	// Override `promise` to get use the current value if there is one.
	get promise(): Promise<T> {
		return this._value === LOADING ? super.promise : Promise.resolve(this._value);
	}
}

/**
 * Is an unknown value a `State` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `State`.
 */
export const isState = <T extends State<unknown>>(state: T | unknown): state is T => state instanceof State;
