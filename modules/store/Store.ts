import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { isAsync } from "../util/async.js";
import { NONE } from "../util/constants.js";
import { awaitDispose } from "../util/dispose.js";
import { isDeepEqual } from "../util/equal.js";
import type { Arguments } from "../util/function.js";
import { getStarter, type PossibleStarter, type Starter } from "../util/start.js";

/** Any `Store` instance. */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyStore = Store<any>;

/**
 * Store that retains its most recent value and is async-iterable to allow values to be observed.
 * - Current value can be read at `store.value` and `store.data`
 * - Stores also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - Stores can also be in a loading store where they do not have a current value.
 *
 * @param initial The initial value for this store, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `Store` instance to take the initial value from and subscribe to.
 * - To set this store to be loading, use the `NONE` constant or a `Promise` value.
 * - To set this store to an explicit value, use that value or another `Store` instance with a value.
 */
export class Store<T> implements AsyncIterable<T, void, void>, AsyncDisposable {
	/** Deferred sequence this store uses to issue values as they change. */
	public readonly next = new DeferredSequence<T>();

	/**
	 * Store is considered to be "loading" if it has no value or error.
	 * - Calling `this.value` will throw `this.reason` if there's an error reason set, or a `Promise` if there's no value set.
	 * - Calling `this.loading` is a way to check if this store has a value without triggering those throws.
	 */
	get loading(): boolean {
		return this._value === NONE && this._reason === undefined;
	}

	/**
	 * Get the current value of this store.
	 *
	 * @throws {Promise} if this store currently has no value (resolves when this store receives its next value or error).
	 * @throws {unknown} if this store currently has an error.
	 */
	get value(): T {
		if (this._reason !== undefined) throw this._reason;
		if (this._value === NONE) throw this.next;
		return this._value;
	}
	/**
	 * Set the value of this store .
	 * - Silently discards any pending `await()` calls.
	 * - Awaits any async values.
	 */
	set value(value: T | typeof NONE | PromiseLike<T | typeof NONE>) {
		if (isAsync(value)) {
			void this.await(value);
		} else {
			this.abort();
			this._reason = undefined;
			if (value === NONE) {
				this._time = undefined;
				this._value = value;
				this.next.cancel();
			} else if (this._value === NONE || !this.isEqual(value, this._value)) {
				this._time = Date.now();
				this._value = value;
				this.next.resolve(value);
			}
		}
	}
	private _value: T | typeof NONE;

	/**
	 * Time (in milliseconds) this store was last updated with a new value.
	 * - Will be `undefined` if the value is still loading.
	 */
	get time(): number | undefined {
		return this._time;
	}
	private _time: number | undefined;

	/**
	 * How old this store's value is (in milliseconds).
	 * - Will be `Infinity` if the value is still loading (to simplify downstream calculations).
	 *
	 * @example if (store.age > MINUTE) refreshStore(store);
	 */
	get age(): number {
		const time = this.time;
		return typeof time === "number" ? Date.now() - time : Infinity;
	}

	/** Current error of this store, or `undefined` if there is no error. */
	get reason(): unknown {
		return this._reason;
	}
	set reason(reason: unknown) {
		this.abort();
		this._reason = reason;
		if (reason !== undefined) this.next.reject(reason);
	}
	private _reason: unknown = undefined;

	/**
	 * Set a starter for this store to allow a function to execute when this store has subscribers or not.
	 *
	 * @todo DH: Change this significantly. Not happy with how it's settable like this. It should be set in `constructor()`?
	 */
	protected set starter(start: PossibleStarter<[this]>) {
		if (this._starter) this._starter.stop(); // Stop the current starter.
		this._starter = getStarter(start);
		if (this._iterating) this._starter.start(this); // Start the new starter if we're already iterating.
	}
	private _starter: Starter<[this]> | undefined;

	/** Store is initiated with an initial store. */
	constructor(value: T | typeof NONE) {
		this._value = value;
		this._time = value === NONE ? -Infinity : Date.now();
	}

	/** Set the value of this store as values are pulled from a sequence. */
	async *through(sequence: AsyncIterable<T>): AsyncIterable<T> {
		for await (const value of sequence) {
			this.value = value;
			yield value;
		}
	}

	/**
	 * Call a callback that returns a new value (possibly async) for this store.
	 * - Errors are stored as `reason`; never throws.
	 *
	 * @returns `true` if the value was applied, `false` if an error occurred or the result was superseded.
	 */
	call<A extends Arguments = []>(callback: (...args: A) => T | PromiseLike<T>, ...args: A): Promise<boolean> | boolean {
		try {
			const value = callback(...args);
			if (isAsync(value)) return this.await(value);
			this.value = value;
			return true;
		} catch (thrown) {
			this.reason = thrown;
			return false;
		}
	}

	/**
	 * Reduce the current value using a reducer callback that receives the current value.
	 *
	 * @param reducer The callback function to call that should return a value to set on this store.
	 * 		@param value The current value of this store.
	 * 		@param args Any additional input values for the reducer.
	 * 		@returns New value for this store (possibly async).
	 * @oaram args Any arguments to pass to the callback.
	 *
	 * @throws {Promise} if this store currently has no value (resolves when this store receives its next value or error).
	 * @throws {unknown} if this store currently has an error reason set.
	 */
	reduce<A extends Arguments = []>(reducer: (value: T, ...args: A) => T | PromiseLike<T>, ...args: A): Promise<boolean> | boolean {
		return this.call(reducer, this.value, ...args);
	}

	/**
	 * Await an async value and save it to this store.
	 * - Saves the resolved value.
	 * - If it rejects saves the rejection as `reason`.
	 * - Silently discarded if a newer value is set.
	 * - Silently discarded if `await()` is called again.
	 * - Silently discarded if `abort()` is called.
	 *
	 * @returns `true` if the value was applied, `false` if superseded, aborted, or errored.
	 * @throws {never} Never throws — safe to call without handling the return value.
	 */
	async await(asyncValue: PromiseLike<T | typeof NONE>): Promise<boolean> {
		// Keep track of the value that is being awaited.
		// If `_pendingValue` changes while waiting for `asyncValue` to resolve, another call to `await()` has `set value`, `set reason`, or `abort()` has invalidated this one.
		// If that happens we silently discard the resolved value/reason of this await call.
		this._pendingValue = asyncValue;
		try {
			const value = await asyncValue;
			if (this._pendingValue === asyncValue) {
				this.value = value;
				return true;
			}
			return false;
		} catch (reason) {
			if (this._pendingValue === asyncValue) {
				this.reason = reason;
			}
			return false;
		}
	}
	private _pendingValue: PromiseLike<T | typeof NONE> | undefined = undefined;

	/**
	 * Abort any current pending `await()` call.
	 * - The pending call's result will be silently discarded and its error will not be stored.
	 */
	abort(): void {
		this._pendingValue = undefined;
	}

	// Implement `AsyncIterator`
	// Issues the current value of this store first, then any subsequent values that are issued.
	async *[Symbol.asyncIterator](): AsyncIterator<T, void, void> {
		await Promise.resolve(); // Introduce a slight delay, i.e. don't immediately yield `this.value` in case it is changed synchronously.
		this._starter?.start(this);
		this._iterating++;
		try {
			if (this._reason !== undefined) throw this._reason;
			if (this._value !== NONE) yield this._value;
			yield* this.next;
		} finally {
			this._iterating--;
			if (this._iterating < 1) this._starter?.stop();
		}
	}
	private _iterating = 0;

	/** Compare two values for this store and return whether they are equal. */
	isEqual(a: T, b: T): boolean {
		return isDeepEqual(a, b);
	}

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			this._starter, // Stop the starter.
			this.next, // Send `done: true` to all iterators of the next sequence.
		);
	}
}
