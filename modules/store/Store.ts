import { DeferredSequence } from "../sequence/DeferredSequence.js";
import { isAsync } from "../util/async.js";
import { NONE, SKIP } from "../util/constants.js";
import { awaitDispose } from "../util/dispose.js";
import { isDeepEqual } from "../util/equal.js";
import type { AnyCaller, Arguments } from "../util/function.js";
import { getStarter, type PossibleStarter, type Starter } from "../util/start.js";

/** Any `Store` instance. */
// biome-ignore lint/suspicious/noExplicitAny: `unknown` causes edge case matching issues.
export type AnyStore = Store<any, any>;

/** Values that a store natively knows how to process as inputs. */
export type StoreInput<I> = I | typeof SKIP | typeof NONE;

/** Internal storage value for a store. */
export type StoreInternal<O> = O | typeof NONE;

/** Callback that sets a store's value (possibly asynchronously). */
export type StoreCallback<I, A extends Arguments = []> = (...args: A) => StoreInput<I> | PromiseLike<StoreInput<I>>;

/** Reducer that receives a store's current value and sets the stores next value (possibly asynchronously). */
export type StoreReducer<I, O, A extends Arguments = []> = (value: O, ...args: A) => StoreInput<I> | PromiseLike<StoreInput<I>>;

/**
 * Store that retains its most recent value and is async-iterable to allow values to be observed.
 * - Current value can be read at `store.value` and `store.data`
 * - Stores also send their most-recent value to any new subscribers immediately when a new subscriber is added.
 * - Stores can also be in a loading store where they do not have a current value.
 *
 * @param initial The initial value for this store, a `Promise` that resolves to the initial value, a source `Subscribable` to subscribe to, or another `Store` instance to take the initial value from and subscribe to.
 * - To set this store to be loading, use the `NONE` constant or a `Promise` value.
 * - To set this store to an explicit value, use that value or another `Store` instance with a value.
 *
 * @param T The "main type" for this store.
 * - Indicates what values `this.value` will return.
 * - Methods that set values like `this.call()` and `this.await()` can also accept these values.
 * @param TT The "input type" for this store.
 * - Indicates what additional input types `this.value` can convert to `T`
 * - Defaults to `T` (no conversion).
 * - Override conversion by overriding `this._convert(v: TT): T`
 * - Warning: With no override, default behaviour is to just assert TT is T (unsafe).
 */
export class Store<T, TT = T> implements AsyncIterable<T, void, void>, AsyncDisposable {
	/** Deferred sequence this store uses to issue values as they change. */
	public readonly next = new DeferredSequence<T>();

	/**
	 * Snapshot returns either the current reason or the current value (or `NONE` if reason is unset).
	 */
	get snapshot(): unknown {
		return this._reason !== undefined ? this._reason : this._value;
	}

	/**
	 * Store is considered to be "loading" if it has no value or error.
	 * - Calling `this.value` will throw `this.reason` if there's an error reason set, or a `Promise` if there's no value set.
	 * - Calling `this.loading` is a way to check if this store has a value without triggering those throws.
	 */
	get loading(): boolean {
		return this._value === NONE && this.reason === undefined;
	}

	/**
	 * Set the value of this store.
	 * - Sets any sync values.
	 * - Awaits any async values.
	 * - Setting value the `NONE` symbol indicates the store has no value so should be in a "loading" state.
	 * - Setting value to `SKIP` indicates the value should be silently ignored (sometimes it's helpful to have a way to skip a write entirely).
	 * - Setting value to the same as the existing value
	 * - If this store has any pending `await()` calls they are aborted and their results are silently discarded.
	 */
	set value(input: StoreInput<TT> | PromiseLike<StoreInput<TT>>) {
		if (isAsync(input)) void this.await(input);
		else this.write(input);
	}

	/** Write a synchronous value to this store. */
	write(input: StoreInput<TT>): void {
		this.abort();
		this._reason = undefined;
		if (input === SKIP) {
			// Skip this value entirely.
			return;
		} else if (input === NONE) {
			// Put the store into a loading state.
			this._time = undefined;
			this._value = NONE;
			this.next.cancel();
			return;
		}

		const storage = this._convert(input);
		if (this._value === NONE || !this._equal(storage, this._value)) {
			// Set this changed value.
			this._time = Date.now();
			this._value = storage;
			this.next.resolve(storage);
		}
	}

	/**
	 * Convert input type to internal storage type.
	 * - Override in subclasses to change conversion behaviour.
	 * - Warning: With no override, default behaviour is to just assert TT is T (unsafe).
	 */
	protected _convert(input: TT, _caller?: AnyCaller): T {
		return input as unknown as T;
	}

	/** Compare two values for this store and return whether they are equal. */
	protected _equal(a: T, b: T): boolean {
		return isDeepEqual(a, b);
	}

	/** Internal storage for current value. */
	private _value: StoreInternal<T>;

	/**
	 * Get the current value of this store.
	 *
	 * @throws {Promise} if this store currently is in a "loading" state (resolves when a value is set).
	 * @throws {unknown} if this store currently has an error.
	 */
	get value(): T {
		if (this._reason !== undefined) throw this._reason;
		const value = this.read();
		if (value === NONE) throw this.next;
		return value;
	}

	/**
	 * Called to read values. Can be used to override get behaviour.
	 * - Override in subclasses to change getting behaviour.
	 * - Note: doesn't throw `reason` if there is one!
	 */
	read(): StoreInternal<T> {
		return this._value;
	}

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
	 *  - Also would love some internal hooks
	 */
	protected set starter(start: PossibleStarter<[this]>) {
		if (this._starter) this._starter.stop(); // Stop the current starter.
		this._starter = getStarter(start);
		if (this._iterating) this._starter.start(this); // Start the new starter if we're already iterating.
	}
	private _starter: Starter<[this]> | undefined;

	/** Store is initiated with a value, or `NONE` to put it in a "loading" state. */
	constructor(value: StoreInternal<T>) {
		this._value = value;
		this._time = value === NONE ? -Infinity : Date.now();
	}

	/** Set the value of this store as values are pulled from a sequence. */
	async *through(sequence: AsyncIterable<TT>): AsyncIterable<TT> {
		for await (const value of sequence) {
			this.write(value);
			yield value;
		}
	}

	/**
	 * Call a callback and save the returned value to this store.
	 * - If the callback returns an async value, it is awaited and values/errors will be saved.
	 */
	call<A extends Arguments>(callback: StoreCallback<TT, A>, ...args: A): Promise<boolean> | boolean {
		try {
			const value = callback(...args);
			if (isAsync(value)) return this.await(value);
			this.write(value);
			return true;
		} catch (thrown) {
			this.reason = thrown;
			return false;
		}
	}

	/**
	 * Send the current value to a callback and save the returned value to this store.
	 * - If the callback returns an async value, it is awaited and values/errors will be saved.
	 */
	reduce<A extends Arguments>(reducer: StoreReducer<TT, T, A>, ...args: A): Promise<boolean> | boolean {
		return this.call(reducer, this.value, ...args);
	}

	/**
	 * Run a callback and ignore any returned value.
	 * - If the callback returns an async value, it is awaited and errors will be saved.
	 */
	run<A extends Arguments>(callback: (...args: A) => void, ...args: A): Promise<boolean> | boolean {
		return this.call(_callSkipped, callback, ...args);
	}

	/**
	 * Send the current value to a callback and ignore any returned value.
	 * - If the callback returns an async value, it is awaited and errors will be saved.
	 */
	send<A extends Arguments>(callback: (value: T, ...args: A) => void, ...args: A): Promise<boolean> | boolean {
		return this.call(_callSkipped, callback, this.value, ...args);
	}

	/**
	 * Await an async value and save it to this store.
	 * - Saves the resolved value.
	 * - If it rejects saves the rejection as `reason`.
	 * - Silently discarded if a newer value is set.
	 * - Silently discarded if `await()` is called again.
	 * - Silently discarded if `abort()` is called.
	 *
	 * @param pending The pending value to await.
	 *
	 * @returns {true} If the callback returned a value and it was set.
	 * @returns {false} If the callback threw.
	 * @returns {Promise<true>} If the callback returned a promise and it resolved.
	 * @returns {Promise<false>} If the callback returned a promise and it rejected, or `abort()` was called before it resolved.
	 *
	 * @throws {never} Never throws — safe to call without handling the return value.
	 */
	async await(pending: PromiseLike<StoreInput<TT>>): Promise<boolean> {
		// Keep track of the value that is being awaited.
		// If `_pendingValue` changes while waiting for `asyncValue` to resolve, another call to `await()` has `set value`, `set reason`, or `abort()` has invalidated this one.
		// If that happens we silently discard the resolved value/reason of this await call.
		this._pendingValue = pending;
		try {
			const value = await pending;
			if (this._pendingValue === pending) {
				this.write(value);
				return true;
			}
			return false;
		} catch (reason) {
			if (this._pendingValue === pending) {
				this.reason = reason;
			}
			return false;
		}
	}
	private _pendingValue: PromiseLike<StoreInput<TT>> | undefined = undefined;

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
			const reason = this.reason;
			if (reason !== undefined) throw reason;
			if (!this.loading) yield this.value;
			yield* this.next;
		} finally {
			this._iterating--;
			if (this._iterating < 1) this._starter?.stop();
		}
	}
	private _iterating = 0;

	// Implement `AsyncDisposable`
	async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			this._starter, // Stop the starter.
			this.next, // Send `done: true` to all iterators of the next sequence.
		);
	}
}

/** Call a callback but always return or resolve to `SKIP` */
function _callSkipped<A extends Arguments>(callback: (...args: A) => unknown, ...args: A): typeof SKIP | PromiseLike<typeof SKIP> {
	const value = callback(...args);
	if (isAsync(value)) return _awaitSkipped(value);
	return SKIP;
}

/** Await a promise but resolve to `SKIP` */
async function _awaitSkipped(pending: PromiseLike<unknown>): Promise<typeof SKIP> {
	await pending;
	return SKIP;
}
