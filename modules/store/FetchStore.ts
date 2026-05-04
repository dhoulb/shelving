import { RequiredError } from "../error/RequiredError.js";
import { isAsync } from "../util/async.js";
import { ABORT, type NONE, SKIP } from "../util/constants.js";
import { BusyStore } from "./BusyStore.js";
import type { AsyncStoreInput, StoreInput } from "./Store.js";

/** Callback for a callback fetch store. */
export type FetchCallback<T> = (signal: AbortSignal) => StoreInput<T> | PromiseLike<StoreInput<T>>;

/**
 * Store that fetches its values from a remote source.
 *
 * @param value The initial value for the store, or `NONE` if it does not have one yet.
 * @param callback An optional callback that, if set, will be called when the `refresh()` method is invoked to fetch the next value.
 * - Override `this._fetch()` in subclasses to define custom fetching behaviour for a subclass.
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
	 * - Never throws — errors are stored as `reason`.
	 */
	refresh(maxAge?: number): Promise<boolean> | boolean {
		if (this._pendingRefresh) return this._pendingRefresh;
		if (!this.stale(maxAge)) return false;
		try {
			const value = this._fetch(this.signal); // Retrieving a new signal calls `abort()` which cancels the previous one.
			if (isAsync(value)) return (this._pendingRefresh = this.await(value));
			this.value = value;
			return true;
		} catch (thrown) {
			this.reason = thrown;
			return false;
		}
	}
	private _pendingRefresh: Promise<boolean> | undefined = undefined;

	/**
	 * Current `AbortSignal` for this store's in-flight fetch.
	 * - Created lazily; a new signal is issued each time `refresh()` starts a new fetch or `abort()` is called.
	 * - Triggers `abort()` so any current awaits are cancelled.
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

	/** Whether this store is has currently been invalidated and needs a refresh. */
	get invalidated(): boolean {
		return !!this._invalidation;
	}

	/**
	 * Invalidate this store so a new fetch is triggered on the next read of `loading` or `value`.
	 * - Triggers `abort()` so any current awaits are cancelled.
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
