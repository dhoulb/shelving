import {
	AsyncDeriver,
	LOADING,
	ImmutableObject,
	Mutable,
	assertObject,
	Resolvable,
	Observer,
	isObservable,
	Observable,
	isAsync,
	getRequired,
	Transforms,
	transformProps,
} from "../util/index.js";
import { DeriveStream } from "./DeriveStream.js";
import { Stream } from "./Stream.js";
import { getNextValue } from "./util.js";

/**
 * State: a stream the retains its msot recent value and makes it available at `state.value` and `state.data`
 */
export class State<T> extends Stream<T | typeof LOADING, T> implements Observer<T>, Observable<T> {
	/**
	 * Create a new `State` instance.
	 *
	 * @param initial The initial value for the state, a `Promise` that resolves to the initial value, a source `Observable` to subscribe to, or another `State` instance to take the initial value from and subscribe to.
	 * - Not setting `initial` sets the initial value to `undefined`
	 * - To set the `initial` value to `LOADING` explicitly set it to `LOADING`
	 */
	static create<X>(): State<X | undefined>;
	static create<X>(initial: State<X> | Observable<X> | Resolvable<X> | typeof LOADING): State<X>;
	static create<X>(initial?: State<X> | Observable<X> | Resolvable<X> | typeof LOADING): State<X | undefined> {
		return new State<X | undefined>(initial);
	}

	private _value: T | typeof LOADING = LOADING; // Current value (may not have been fired yet).

	readonly updated: number | undefined = undefined; // Time the value was last updated.
	readonly loading: boolean = true; // Whether we're currently loading or we have a value (if false, reading `state.value` will not throw).
	readonly pending: boolean = true; // Whether a new value is pending (i.e. has been
	readonly reason: Error | unknown = undefined; // The error that caused this state to close.

	/**
	 * Get current value (synchronously).
	 *
	 * @returns Current value of this state.
	 * @throws Promise if the value is currently loading.
	 * @throws `Error | unknown` if this state has errored.
	 */
	get value(): T {
		if (this.reason) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this);
		return this._value;
	}

	/**
	 * Get current or next value (asynchronously).
	 * - Gets current value synchronously (if value is not loading).
	 * - Gets next value asynchronously (if value is still loading).
	 *
	 * @returns Current value of this state (possibly promised).
	 * @throws `Error | unknown` if this state has errored.
	 */
	get asyncValue(): T | Promise<T> {
		if (this.reason) throw this.reason;
		return this._value === LOADING ? getNextValue(this) : this._value;
	}

	/**
	 * Get next value (asynchronously).
	 *
	 * @returns Next value of this state.
	 * @throws `Error | unknown` if this state has errored.
	 */
	get nextValue(): Promise<T> {
		return getNextValue(this);
	}

	/**
	 * Get current required data value (synchronously).
	 *
	 * @returns Current data value of this state.
	 * @throws Promise if the value is currently loading.
	 * @throws RequiredError if the value is currently `undefined`
	 * @throws `Error | unknown` if this state has errored.
	 */
	get data(): Exclude<T, undefined> {
		if (this.reason) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this).then(getRequired);
		return getRequired(this._value);
	}

	/**
	 * Get current or next data value (synchronously).
	 * - Gets current data value synchronously (if value is not loading).
	 * - Gets next data value asynchronously (if value is still loading).
	 *
	 * @returns Current data value of this state (possibly promised).
	 * @throws Promise if the value is currently loading.
	 * @throws RequiredError if the value is currently `undefined`
	 * @throws `Error | unknown` if this state has errored.
	 */
	get asyncData(): Exclude<T, undefined> | Promise<Exclude<T, undefined>> {
		if (this.reason) throw this.reason;
		return this._value === LOADING ? getNextValue(this).then(getRequired) : getRequired(this._value);
	}

	/**
	 * Get next data value (asynchronously).
	 *
	 * @returns Next data value of this state.
	 * @throws RequiredError if the value is currently `undefined`
	 * @throws `Error | unknown` if this state has errored.
	 */
	get nextData(): Promise<Exclude<T, undefined>> {
		return getNextValue(this).then(getRequired);
	}

	/** Age of the current data (in milliseconds). */
	get age(): number {
		return typeof this.updated === "number" ? Date.now() - this.updated : Infinity;
	}

	// Protected (use `State.create()` to create new `State` instances).
	protected constructor(initial: State<T> | Observable<T> | Resolvable<T> | typeof LOADING) {
		super(isObservable(initial) ? initial : undefined);
		if (initial instanceof State) {
			if (!initial.loading) this.next(initial.value);
		} else if (!isObservable(initial)) {
			this.next(initial);
		}
	}

	override next(value: Resolvable<T | typeof LOADING>): void {
		if (isAsync(value)) (this as Mutable<this>).pending = true;
		super.next(value);
	}

	// Override `dispatchNext()` to save the current value and only dispatch non-loading values.
	protected override _dispatchNext(value: T | typeof LOADING): void {
		if (value === this._value) return;
		(this as Mutable<this>).pending = false;
		this._value = value;
		(this as Mutable<this>).loading = value === LOADING;
		(this as Mutable<this>).updated = Date.now();
		if (value !== LOADING) super._dispatchNext(value);
	}

	/**
	 * Set the entire value of this State.
	 * - Listeners will fire (if value is different).
	 * - Similar to `next()` (since this is an Observer) but only allows exact T (not `SKIP` or `Promise<T>` etc).
	 */
	set(value: T): void {
		this.next(value);
	}

	/**
	 * Update properties in this State.
	 * - Listeners will fire (if value is different).
	 *
	 * @throws AssertionError if current value of this `State` is not an object.
	 */
	update(transforms: Transforms<T & ImmutableObject>): void {
		assertObject<T & ImmutableObject>(this._value);
		this.next(transformProps<T & ImmutableObject>(this._value, transforms));
	}

	// Override `dispatchError()` to save the reason at `this.reason` and clean up.
	protected override _dispatchError(reason: Error | unknown): void {
		(this as Mutable<this>).pending = false;
		(this as Mutable<this>).reason = reason;
		super._dispatchError(reason);
	}

	// Override `dispatchComplete()` to clean up.
	protected override _dispatchComplete(): void {
		(this as Mutable<this>).pending = false;
		super._dispatchComplete();
	}

	/**
	 * Derive a new state from this state.
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
			const deriving = new DeriveStream<T, TT>(deriver, this); // New deriving stream subscribed to this.
			const derived = new State<TT>(deriving); // New derived state subscribed to the deriving stream.
			if (this._value !== LOADING) deriving.next(this._value); // Send the next value to the deriving stream, which derives the new value and sends it to the derived state.
			return derived;
		} else {
			return new State<T>(this);
		}
	}
}
