import { RequiredError } from "../errors";
import { LOADING } from "../constants";
import { logError } from "../console";
import { ImmutableObject, updateProps } from "../object";
import { ImmutableArray, ArrayType, swapItem, withoutItem, withItem } from "../array";
import { Event } from "../event";
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
 * Async values:
 * - Pass a `Promise` as the initial value and it will be awaited, and when it reslves the new state will be set.
 * - Pass a `Promise` into `state.set()` and it will be awaited, and the when it resolves the new state will be set.
 * - Note: when using Promises it's possible to create race conditions, so be careful.
 *
 * Object/array state:
 * - If state is an object, you can update its props using `state.update(partialState)`
 * - If state is an array, you can add/remove items from the array using `state.withItem(item)` and `state.withoutItem(item)` and `state.removeItem(old, new)`
 *
 * Loading state:
 * - Set the initial value to a `Promise` or the `LOADING` symbol and its internal value will be set to loading.
 * - While internal value is a `Promise`, calls to `state.data` and `state.value` will throw a `Promise`
 * - Use `state.loading` to test if state is loading if you want to avoid the promise being thrown.
 * - Once a state has loaded once it cannot be set back to loading again.
 */
export class State<T> extends Event<T> {
	/** Current value. */
	protected _value: T | Promise<T>;

	/** Last fired value. */
	protected _fired: T | Promise<T>;

	/**
	 * Detect whether this state is loading (i.e. its internal value is a `Promise`).
	 * @returns `true` if this state is loading or `false` otherwise.
	 */
	get loading(): boolean {
		return this._value instanceof Promise;
	}

	/**
	 * Current value.
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get value(): T {
		if (this._value instanceof Promise) throw this._value;
		return this._value;
	}

	/**
	 * Current data value.
	 * @throws RequiredError if the value is currently `undefined` or `null`
	 * @throws Promise if the value is currently loading (Promise resolves when a non-Promise value is set).
	 */
	get data(): Exclude<T, undefined> {
		if (this.value === undefined) throw new RequiredError("State.data: State data does not exist");
		return this.value as Exclude<T, undefined>;
	}

	constructor(initial: Promise<T> | T | typeof LOADING) {
		super();

		// If initial is a promise, set value of this state when it resolves.
		if (initial instanceof Promise) {
			initial.then(v => {
				// Only if the value of this State hasn't already changed.
				// No need to fire listeners for the initial value.
				if (this._value === initial) {
					this._value = v;
					this._fired = v;
				}
			}, logError);
		}

		// Save value (if value is LOADING, set value to a self-initialised Promise).
		this._value = initial === LOADING ? new Promise<T>(r => void this.one(r)) : initial;
		this._fired = this._value;
	}

	/**
	 * Override the `fire` function to check the value, save the value, and ignore the value if it's a `Promise`.
	 * - Multiple state updates in a single tick will only fire event listeners once (at the end of the tick).
	 * - Only fires the listeners if the value has changed.
	 */
	fire(value: T): void {
		this._value = value;
		Promise.resolve().then(this._fire, logError);
	}
	private _fire = (): void => {
		if (!(this._value instanceof Promise) && this._fired !== this._value) {
			this._fired = this._value;
			super.fire(this._value);
		}
	};

	/**
	 * Set a new value for this value.
	 * - Listeners will fire (if value is different).
	 * - If value is a Promise, it is awaited and set after the value resolves.
	 */
	set(value: Promise<T> | T): void {
		if (value instanceof Promise) {
			// Value is a `Promise` so wait for it to resolve before calling listeners.
			value.then(v => this.set(v), logError);
		} else {
			// Value is not a `Promise` so fire now.
			this.fire(value);
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
		this.fire(updateProps<X>(this.value as X, partial));
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	add<X extends T & ImmutableArray>(item: ArrayType<X>): void {
		assertArray(this._value);
		this.fire(withItem(this._value, item) as X);
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	remove<X extends T & ImmutableArray>(item: ArrayType<X>): void {
		assertArray(this._value);
		this.fire(withoutItem(this._value, item) as X);
	}

	/**
	 * Treat this state as an array and replace an item in its value.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an array.
	 */
	swap<X extends T & ImmutableArray>(oldItem: ArrayType<X>, newItem: ArrayType<X>): void {
		assertArray(this._value);
		this.fire(swapItem(this._value, oldItem, newItem) as X);
	}

	/**
	 * Create a new derived state from this state.
	 * - Makes a new state instance attached to this state
	 * - The `derive()` function takes this state value and returns the new state value.
	 * - When this state updates, the `derive()` function is rerun and the new state is updated.
	 *
	 * @param derive Function that does the deriving. Accepts the state value from this state and returns the new derived state value.
	 * @returns New `State` instance derived from this one.
	 */
	derive<U>(derive: (value: T) => Promise<U> | U): State<U> {
		const state = new State<U>(this._value instanceof Promise ? this.then(derive) : derive(this._value));
		this.on(v => state.set(derive(v)));
		return state;
	}

	/**
	 * Thenable implementation.
	 * - You can `await` this state to get its current value.
	 * - If the current value is still loading this will resolve when it resolves.
	 * - Otherwise this will resolve immediately.
	 */
	then<U, V = never>(onNext?: (value: T) => Promise<U> | U, onError?: () => V): Promise<U | V> {
		const promise = this._value instanceof Promise ? new Promise<T>(r => void this.one(r)) : Promise.resolve(this._value);
		return promise.then(onNext, onError);
	}
}

/** Create a new `State` instance. */
export const createState = <T>(initialValue: Promise<T> | T | typeof LOADING): State<T> => new State(initialValue);

/**
 * Is an unknown value a `State` instance?
 * - This is a TypeScript assertion function, so if this function returns `true` the type is also asserted to be a `State`.
 */
export const isState = <T extends State<unknown>>(state: T | unknown): state is T => state instanceof State;
