import type { AsyncDeriver } from "../function";
import type { Observer, Subscribable } from "../observe";
import { RequiredError } from "../errors";
import { LOADING, SKIP } from "../constants";
import { logError } from "../console";
import { ImmutableObject, Mutable, updateProps } from "../object";
import { ImmutableArray, ArrayType, swapItem, withoutItem, withItem } from "../array";
import { Stream } from "../stream";
import { assertArray, assertObject } from "../assert";

/**
 * State: store some global state in memory.
 *
 * Usage:
 * - Make a state with `createState(initialState)`
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
export class State<T> extends Stream<T> implements PromiseLike<T>, Observer<T>, Subscribable<T> {
	private _value: T | typeof LOADING = LOADING; // Current value (may not have been fired yet).
	private _fired: T | typeof LOADING = LOADING; // Last value that was fired.
	private _closed = false;

	readonly reason?: Error | unknown; // The error that caused this state to close.
	readonly updated?: number; // Time we last updated a new value.

	/** Whether the state has loaded yet, or not. */
	get loading(): boolean {
		return this._value === LOADING;
	}

	/**
	 * Get current value.
	 * @throws `Error | unknown` if this state has errored.
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get value(): T {
		if (this.reason) throw this.reason;
		if (this._value === LOADING) throw super.then();
		return this._value;
	}

	/**
	 * Current data value.
	 * @throws RequiredError if the value is currently `undefined` or `null`
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get data(): Exclude<T, undefined> {
		const value: T | Exclude<T, undefined> = this.value;
		if (value === undefined) throw new RequiredError("State.data: State data does not exist");
		return value as Exclude<T, undefined>;
	}

	constructor(value: Promise<T | typeof SKIP> | T | typeof SKIP | typeof LOADING) {
		super();
		if (value instanceof Promise) {
			// If initial is a promise, set value of this state when it resolves.
			void this._asyncNext(value);
		} else if (value !== LOADING && value !== SKIP) {
			// If initial is an explicit value, save it.
			this._value = value;
			(this as Mutable<this>).updated = Date.now();
		}
	}

	// Override `next()` to save the value and defer calling listeners to the end of the tick.
	// This ensures that if `next()` is called multiple times within a tick the listeners will only be called once.
	next(value: Promise<T | typeof SKIP> | T | typeof SKIP): void {
		if (this._closed) return;
		if (value === SKIP) return;
		if (value instanceof Promise) {
			void this._asyncNext(value);
		} else {
			this._value = value;
			(this as Mutable<this>).updated = Date.now();
			Promise.resolve().then(this._tick, logError);
		}
	}
	private async _asyncNext(value: Promise<T | typeof SKIP>): Promise<void> {
		try {
			this.next(await value);
		} catch (thrown) {
			this.error(thrown);
		}
	}

	// Override `error()` to save the error and defer calling listeners to the end of the tick.
	error(reason: Error | unknown): void {
		if (this._closed) return;
		(this as Mutable<this>).reason = reason;
		this._closed = true;
		Promise.resolve().then(this._tick, logError);
	}

	// Override `complete()` to defer calling listeners to the end of the tick.
	// This ensures that if `next()` is called before `complete()`, the `next()` listeners will correctly be called before `complete()`
	complete(): void {
		if (this._closed) return;
		this._closed = true;
		Promise.resolve().then(this._tick, logError);
	}

	// Run at the end of a tick to call listeners.
	private _tick = (): void => {
		if (this.closed) return;
		if (this.reason) {
			// If there's an error call `error()`
			super.error(this.reason);
		} else {
			// Otherwise call `next()` and possibly `complete()`
			if (this._value !== this._fired && this._value !== LOADING) {
				this._fired = this._value;
				super.next(this._value);
			}
			if (this._closed) super.complete();
		}
	};

	/**
	 * Set a new value for this value.
	 * - Listeners will fire (if value is different).
	 * - If value is a Promise, it's awaited and set after it value resolves.
	 */
	set(value: Promise<T | typeof SKIP> | T | typeof SKIP): void {
		// This is the next value.
		this.next(value);
	}

	/**
	 * Update properties in this State
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an object.
	 */
	update<X extends T & ImmutableObject>(partial: Partial<X>): void {
		assertObject(this._value);
		this.next(updateProps<X>(this._value as X, partial));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	add<X extends T & ImmutableArray>(item: ArrayType<X>): void {
		assertArray(this._value);
		this.next(withItem(this._value, item) as X);
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	remove<X extends T & ImmutableArray>(item: ArrayType<X>): void {
		assertArray(this._value);
		this.next(withoutItem(this._value, item) as X);
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	swap<X extends T & ImmutableArray>(oldItem: ArrayType<X>, newItem: ArrayType<X>): void {
		assertArray(this._value);
		this.next(swapItem(this._value, oldItem, newItem) as X);
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
	derive<TT>(deriver?: AsyncDeriver<T, TT | typeof SKIP>): State<TT>;
	derive<TT>(deriver?: AsyncDeriver<T, TT | typeof SKIP>): State<T> | State<TT> {
		if (deriver) {
			// Make a state to hold the derived value, and set it using the current value of this state
			const derivedState = new State<TT>(this._value === LOADING ? super.then(deriver) : deriver(this._value));
			// Create a stream that produces a derived value every time this state updates.
			const derivedStream = super.derive<TT>(deriver);
			// Subscribe our new state to the derived value stream.
			derivedStream.subscribe(derivedState);
			// Return the derived state.
			return derivedState;
		} else {
			// If there's no deriver function just return a copy state and set it using the current value of this state.
			const copyState = new State<T>(this._value === LOADING ? super.then() : this._value);
			this.subscribe(copyState);
			return copyState;
		}
	}

	/**
	 * PromiseLike implementation.
	 * - Lets you `await` this state to get its current value (if there is one) or the next value (when it's set).
	 * - If the current value is still loading this will resolve when it resolves.
	 * - Otherwise this will resolve immediately.
	 */
	then<X = T, Y = never>(next?: (value: T) => PromiseLike<X> | X, error?: (reason: Error | unknown) => PromiseLike<Y> | Y): Promise<X | Y> {
		if (this._value === LOADING) return super.then(next, error);
		return Promise.resolve(this._value).then(next, error);
	}
}

/** Create a new `State` instance. */
export const createState = <T>(initial: Promise<T> | T | typeof LOADING): State<T> => new State(initial);

/**
 * Is an unknown value a `State` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `State`.
 */
export const isState = <T extends State<unknown>>(state: T | unknown): state is T => state instanceof State;
