import { RequiredError } from "../error/RequiredError.js";
import { isAsync } from "../util/async.js";
import { ABORT, NONE, SECOND, SKIP } from "../util/constants.js";
import { BusyStore } from "./BusyStore.js";
import type { AsyncStoreInput, StoreInput } from "./Store.js";

/**
 * `maxAge` of zero passed to `refresh()` means "always refresh this value" (this is the default).
 *
 * @see https://shelving.cc/store/ALWAYS_REFRESH
 */
export const ALWAYS_REFRESH = 0;

/**
 * `maxAge` of `Infinity` passed to `refresh()` means "only refresh if this value is not loaded or invalid".
 *
 * @see https://shelving.cc/store/AVOID_REFRESH
 */
export const AVOID_REFRESH = Infinity;

/** How long after a failed fetch a read of `value` fetches again. React renders a failed component again at once, and this stops that from fetching in a loop. */
const _RETRY_WAIT = SECOND;

/**
 * Callback that fetches the next value for a `FetchStore`.
 * - Receives the current `AbortSignal` so it can cancel in-flight HTTP requests when the fetch is aborted.
 * - May return a value synchronously or a `PromiseLike` resolving to one (which the store will await).
 *
 * @see https://shelving.cc/store/FetchCallback
 */
export type FetchCallback<T> = (signal: AbortSignal) => StoreInput<T> | PromiseLike<StoreInput<T>>;

/**
 * Store that fetches its values from a remote source on demand.
 * - Reading `value` or `loading` optimistically triggers a fetch so the value is available next time.
 * - Fetches are de-duplicated, can be aged out with `maxAge`, and can be forced stale with `invalidate()`.
 * - A failed fetch keeps the current value if there is one. With no value, the error is saved as `reason`, and a read of
 *   `value` a second or more later fetches again (so a retry button works).
 * - Provide a `callback` to fetch values, or subclass and override `this._fetch()` for custom behaviour.
 *
 * @see https://shelving.cc/store/FetchStore
 */
export class FetchStore<T, TT = T> extends BusyStore<T, TT> {
	// Override to trigger a refresh when `this.loading` is read.
	// Calling `store.loading` signals intent to use the value.
	// We optimistically refresh so the value is available the next time the user wants it.
	override get loading(): boolean {
		const loading = super.loading;
		if (this.invalidated || loading) void this.refresh();
		return loading;
	}

	// Override to reset the invalidation state.
	// Setting a value means this store is no longer invalid.
	override write(input: StoreInput<TT>) {
		if (input !== SKIP) this._invalidation = 0;
		super.write(input);
	}

	// Override to trigger refresh on `NONE`
	// Calling `store.value` signals intent to use the value.
	// We optimistically refresh so the value is available the next time the user wants it.
	override read() {
		this.loading; // Ping loading to possibly trigger the intiial fetch.
		return super.read();
	}

	// Override to fetch again when a read comes a second or more after a failed fetch, so a retry button works.
	override get value(): T {
		if (this.reason !== undefined && Date.now() - this._failed >= _RETRY_WAIT) void this.refresh();
		return super.value;
	}
	override set value(input: AsyncStoreInput<TT>) {
		super.value = input;
	}

	// Override to consider invalid to be really old.
	override get age(): number {
		return this.invalidated ? Infinity : super.age;
	}

	// Override to create to save `callback`
	constructor(value: T | typeof NONE, callback?: FetchCallback<TT>) {
		super(value);
		this._callback = callback;
	}

	/**
	 * Fetch the result for this store now.
	 * - Triggered automatically when someone reads `value` or `loading`.
	 * - Refreshes are de-duplicated. Concurrent calls while a fetch is in-flight return the same promise.
	 * - A new fetch clears any old `reason`, so the store shows as loading while it waits.
	 * - A failed fetch keeps the current value if there is one, and the next refresh tries again. With no value, the error is saved as `reason`.
	 *
	 * @param maxAge The maximum age for whether we refresh or not.
	 * - `0` zero means "always refresh" (this is the default).
	 * - `Infinity` means "refresh only if store is still in a loading state.
	 * - Any other value may or may not be stale based on `this.age`
	 * @returns `true` if the value was set synchronously, `false` if no refresh happened or it failed, or a `Promise` resolving to whether the awaited fetch succeeded.
	 * @throws {never} Never throws.
	 * @example store.refresh(MINUTE); // refresh only if the current value is older than a minute
	 * @see https://shelving.cc/store/FetchStore/refresh
	 */
	refresh(maxAge: number = ALWAYS_REFRESH): Promise<boolean> | boolean {
		if (this._pendingRefresh) return this._pendingRefresh;
		if (!this.stale(maxAge)) return false;
		if (this.reason !== undefined) this.reason = undefined;
		try {
			const value = this._fetch(this.signal); // Retrieving a new signal calls `abort()` which cancels the previous one.
			if (isAsync(value)) return (this._pendingRefresh = this._awaitFetch(value));
			this.value = value;
			return true;
		} catch (thrown) {
			this._fail(thrown);
			return false;
		}
	}
	private _pendingRefresh: Promise<boolean> | undefined = undefined;

	/** Await a fetch and save its value. A failure keeps the current value if there is one. */
	private async _awaitFetch(pending: PromiseLike<StoreInput<TT>>): Promise<boolean> {
		let failed = false;
		const done = await this.await(
			Promise.resolve(pending).catch((thrown: unknown): StoreInput<TT> => {
				if (super.read() === NONE) throw thrown; // No value to keep, so `await()` saves the error as `reason`.
				failed = true;
				return SKIP;
			}),
		);
		if (!done && this.reason !== undefined) this._failed = Date.now();
		return done && !failed;
	}

	/** Save a failed fetch's error as `reason`, unless there is a current value to keep. */
	private _fail(thrown: unknown): void {
		if (super.read() !== NONE) return;
		this.reason = thrown;
		this._failed = Date.now();
	}

	/** Time of the last failed fetch that saved a `reason`. */
	private _failed = 0;

	/**
	 * Current `AbortSignal` for this store's in-flight fetch.
	 * - Created lazily; a new signal is issued each time `refresh()` starts a new fetch or `abort()` is called.
	 * - Reading this triggers `abort()` so any current awaits are cancelled.
	 *
	 * @see https://shelving.cc/store/FetchStore/signal
	 */
	get signal(): AbortSignal {
		this.abort();
		this._aborter = new AbortController();
		return this._aborter.signal;
	}
	private _aborter: AbortController | undefined;

	/**
	 * Call the fetch callback to get the next value.
	 * @param signal `AbortSignal` for the current fetch — passed through to the callback so it can cancel HTTP requests etc.
	 */
	protected _fetch(signal: AbortSignal): AsyncStoreInput<TT> {
		if (!this._callback) throw new RequiredError("FetchStore has no callback() function", { store: this, caller: this.refresh });
		return this._callback(signal);
	}
	private _callback: FetchCallback<TT> | undefined;

	/**
	 * Whether this store has currently been invalidated and needs a refresh.
	 *
	 * @see https://shelving.cc/store/FetchStore/invalidated
	 */
	get invalidated(): boolean {
		return !!this._invalidation;
	}

	/**
	 * Invalidate this store so a new fetch is triggered on the next read of `loading` or `value`.
	 * - Triggers `abort()` so any current awaits are cancelled.
	 *
	 * @example store.invalidate(); // next read of `value` refetches
	 * @see https://shelving.cc/store/FetchStore/invalidate
	 */
	invalidate(): void {
		this.abort();
		this._invalidation++;
	}
	private _invalidation = 0;

	// Override to abort any current in-flight fetch and pending async operation.
	// - Sends `ABORT` to the current `AbortSignal` and clears the controller (a new signal will be created on the next read or fetch).
	// - Any pending `await()` result will be silently discarded.
	override abort(): void {
		this._aborter?.abort(ABORT);
		this._aborter = undefined;
		this._pendingRefresh = undefined;
		super.abort(); // clears _pendingValue
	}
}
