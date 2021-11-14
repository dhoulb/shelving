import {
	AsyncDeriver,
	LOADING,
	NOERROR,
	ImmutableObject,
	Mutable,
	assertObject,
	Resolvable,
	Observer,
	Observable,
	getRequired,
	Transforms,
	transformProps,
	dispatchNext,
	dispatchError,
	dispatchComplete,
} from "../util/index.js";
import { DeriveStream } from "./DeriveStream.js";
import { Stream } from "./Stream.js";
import { getNextValue } from "./util.js";

/**
 * State: a stream that retains its msot recent value and makes it available at `state.value` and `state.data`
 * - States also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - States can also be in a loading state where they do not have a current value.
 *
 * @param initial The initial value for the state, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `State` instance to take the initial value from and subscribe to.
 * - To set the state to be loading, use the `LOADING` constant or a `Promise` value.
 * - To set the state to an explicit value, use that value or another `State` instance with a value.
 */
export class State<T> extends Stream<T> implements Observer<T>, Observable<T> {
	/** Current internal value. */
	private _value: T | typeof LOADING = LOADING;

	/** Time the value was last updated. */
	readonly updated: number | undefined = undefined;

	/** The error that caused this state to close. */
	readonly reason: Error | unknown = NOERROR;

	/** Is this state is currently loading? */
	get loading(): boolean {
		return this._value === LOADING;
	}

	/**
	 * Get current value (synchronously).
	 *
	 * @returns Current value of this state.
	 * @throws Promise if the value is currently loading.
	 * @throws `Error | unknown` if this state has errored.
	 */
	get value(): T {
		if (this.reason !== NOERROR) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this);
		return this._value;
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
		if (this.reason !== NOERROR) throw this.reason;
		if (this._value === LOADING) throw getNextValue(this).then(getRequired);
		return getRequired(this._value);
	}

	/** Age of the current data (in milliseconds). */
	get age(): number {
		return typeof this.updated === "number" ? Date.now() - this.updated : Infinity;
	}

	constructor(initial: Resolvable<T> | typeof LOADING) {
		super();
		this.next(initial);
	}

	// Override to allow `LOADING` symbol.
	override next(value: Resolvable<T> | typeof LOADING) {
		super.next(value as Resolvable<T>);
	}

	// Override to save the current value and exclude `LOADING` symbol from dispatch to observers.
	protected override _dispatch(value: T | typeof LOADING): void {
		if (value !== this._value) {
			this._value = value;
			if (value !== LOADING) {
				(this as Mutable<this>).updated = Date.now();
				super._dispatch(value);
			}
		}
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

	// Override `error()` to save the reason at `this.reason` and clean up.
	override error(reason: Error | unknown): void {
		if (!this.closed) (this as Mutable<this>).reason = reason;
		super.error(reason);
	}

	// Override to send the current error or value to any new subscribers.
	override on(observer: Observer<T>) {
		super.on(observer);
		if (this.reason !== NOERROR) dispatchError(observer, this.reason);
		else if (this.closed) dispatchComplete(observer);
		else if (this._value !== LOADING) dispatchNext(observer, this._value);
	}

	/**
	 * Derive from this state to a new or existing target state.
	 * - The `deriver()` function takes this state value and returns the new state value.
	 * - When this state updates, the `deriver()` function is rerun and the new state is updated.
	 * - Uses a `DeriveStream` as middleware to run the `deriver()` function when next values are received.
	 *
	 * @param deriver Deriver function that does the deriving. Accepts the state value from this state and returns the new derived state value.
	 * @param target The target state to stream to (if empty a new `State` will be created).
	 *
	 * @returns The new or existing target state.
	 */
	derive<TT>(deriver: AsyncDeriver<T, TT>): State<TT>;
	derive<TT, S extends Stream<TT>>(deriver: AsyncDeriver<T, TT>, target: S): S; // eslint-disable-line @typescript-eslint/no-explicit-any
	derive<TT>(deriver: AsyncDeriver<T, TT>, target: Observer<TT> = new State<TT>(LOADING)): Observer<TT> {
		const middleware = new DeriveStream(deriver);
		middleware.on(target);
		middleware.start(this);
		return target;
	}
}
