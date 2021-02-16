import type { AsyncDeriver } from "../function";
import type { Observer, Subscribable } from "../observe";
import { RequiredError } from "../errors";
import { LOADING, NOERROR, SKIP } from "../constants";
import { logError } from "../console";
import { ImmutableObject, updateProps } from "../object";
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
	/** Current value. */
	protected _value: T | Promise<T>;

	/** Current error. */
	protected _error: unknown | typeof NOERROR = NOERROR;

	/**
	 * Detect whether this state is loading (i.e. its internal value is a promise).
	 * @returns `true` if this state is loading or `false` otherwise.
	 */
	get loading(): boolean {
		return this._value instanceof Promise;
	}

	/**
	 * Get current value.
	 * @throws unknown if the value currently has an error.
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get value(): T {
		if (this._error !== NOERROR) throw this._error;
		if (this._value instanceof Promise) throw this._value;
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

	constructor(initial: Promise<T | typeof SKIP> | T | typeof SKIP | typeof LOADING) {
		super();
		if (initial instanceof Promise) {
			// If initial is a promise, set value of this state when it resolves.
			initial.then(next => void this.next(next), logError);
			this._value = super.then();
		} else if (initial === LOADING || initial === SKIP) {
			// If initial is LOADING or SKIP, set value to a Promise that resolves after `next()` is called.
			this._value = super.then();
		} else {
			// If initial is an explicit value, save it.
			this._value = initial;
		}
	}

	// Override `next()` so it 1) sets the value and resets the error, and 2) only fires listeners once per tick.
	next(next: T | typeof SKIP): void {
		if (this.closed) return;
		if (next === SKIP) return;
		this._value = next;
		Promise.resolve().then(this._tick, logError);
	}

	// Run at the end of a tick to call `next()` on subscribers.
	private _tick = (): void => {
		if (this.closed) return;
		if (this._value instanceof Promise) return; // Shouldn't happen.
		if (this._value !== this._lastValue) {
			const value = this._value;
			this._lastValue = value;
			super.next(value);
		}
	};
	private _lastValue: T | typeof LOADING = LOADING;

	// Override `error()` so it saves the error.
	error(error: Error | unknown): void {
		if (this.closed) return;
		this._error = error;
		super.error(error);
	}

	/**
	 * Set a new value for this value.
	 * - Listeners will fire (if value is different).
	 * - If value is a Promise, it is awaited and set after the value resolves.
	 */
	set(value: Promise<T> | T): void {
		if (value instanceof Promise) {
			// Value is a promise so wait for it to resolve before calling listeners.
			value.then(v => this.set(v), logError);
		} else if (this._value !== value) {
			// This is the next value.
			this.next(value);
		}
	}

	/**
	 * Update properties in this State
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an object.
	 */
	update<X extends T & ImmutableObject>(partial: Partial<X>): void {
		assertObject(this._value);
		this.set(updateProps<X>(this._value as X, partial));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	add<X extends T & ImmutableArray>(item: ArrayType<X>): void {
		assertArray(this._value);
		this.set(withItem(this._value, item) as X);
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	remove<X extends T & ImmutableArray>(item: ArrayType<X>): void {
		assertArray(this._value);
		this.set(withoutItem(this._value, item) as X);
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	swap<X extends T & ImmutableArray>(oldItem: ArrayType<X>, newItem: ArrayType<X>): void {
		assertArray(this._value);
		this.set(swapItem(this._value, oldItem, newItem) as X);
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
			const derivedState = new State<TT>(this._value instanceof Promise ? this._value.then(deriver) : deriver(this._value));
			// Create a stream that produces a derived value every time this state updates.
			const derivedStream = super.derive<TT>(deriver);
			// Subscribe our new state to the derived value stream.
			derivedStream.subscribe(derivedState);
			// Return the derived state.
			return derivedState;
		} else {
			// If there's no deriver function just return a copy state and set it using the current value of this state.
			const copyState = new State<T>(this._value instanceof Promise ? this._value.then() : this._value);
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
	then<U = T, V = never>(next?: (value: T) => PromiseLike<U> | U, error?: (thrown: Error | unknown) => PromiseLike<V> | V): Promise<U | V> {
		if (this._value instanceof Promise) return this._value.then(next, error);
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
