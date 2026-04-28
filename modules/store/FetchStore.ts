import { RequiredError } from "../error/RequiredError.js";
import { isAsync } from "../util/async.js";
import { ABORT, NONE } from "../util/constants.js";
import { awaitDispose } from "../util/dispose.js";
import { BooleanStore } from "./BooleanStore.js";
import { Store } from "./Store.js";

/** Callback for a callback fetch store. */
export type FetchCallback<T> = (signal: AbortSignal) => T | PromiseLike<T>;

/**
 * Store that fetches its values from a remote source.
 *
 * @param value The initial value for the store, or `NONE` if it does not have one yet.
 * @param callback An optional callback that, if set, will be called when the `refresh()` method is invoked to fetch the next value.
 */
export class FetchStore<T> extends Store<T | typeof NONE, T> {
	/**
	 * Store that indicates the busy state of this store.
	 * - `true` while a refresh is in-flight, `false` otherwise.
	 * - Can be subscribed to for e.g. loading spinners.
	 */
	readonly busy = new BooleanStore(false);

	// Override to trigger a refresh when `this.loading` is read.
	// Reading `loading` signals intent to use the value, so we optimistically start fetching so the value is available.
	override get loading(): boolean {
		const loading = super.loading;
		if (loading || this._invalidation) void this.refresh();
		return loading;
	}

	// Override to reset the invalidation state.
	// Setting a value means this store is no longer invalid.
	protected override _convert(value: T | typeof NONE): T | typeof NONE {
		if (!isAsync(value)) this._invalidation = 0;
		return value;
	}

	// Override to trigger refresh on `NONE`
	// Reading `value` signals intent to use the value, so we optimistically start fetching so the value is available.
	protected override _read(value: T | typeof NONE): T {
		if (value === NONE) void this.refresh();
		return super._read(value);
	}

	// Override to create to save `callback`
	constructor(value: T | typeof NONE, callback?: FetchCallback<T>) {
		super(value);
		this._callback = callback;
	}

	/**
	 * Fetch the result for this store now.
	 * - Triggered automatically when someone reads `value` or `loading`.
	 * - Refreshes are de-duplicated. Concurrent calls while a fetch is in-flight return the same promise.
	 * - Never throws — errors are stored as `reason`.
	 */
	refresh(): Promise<boolean> | boolean {
		if (this._pendingRefresh) return this._pendingRefresh;
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

	// Overload to set `this.busy` to `true` when we start awaiting a value.
	// Gets set back to `false` when `abort()` is called.
	override await(pending: PromiseLike<T>): Promise<boolean> {
		this.busy.value = true;
		return super.await(pending);
	}

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
	protected _fetch(signal: AbortSignal): T | PromiseLike<T> {
		if (!this._callback) throw new RequiredError("FetchStore has no callback() function", { store: this, caller: this.refresh });
		return this._callback(signal);
	}
	private _callback: FetchCallback<T> | undefined;

	/**
	 * Invalidate this store so a new fetch is triggered on the next read of `loading` or `value`.
	 * - Triggers `abort()` so any current awaits are cancelled.
	 */
	invalidate(): void {
		this.abort();
		this._invalidation++;
	}
	private _invalidation = 0;

	/** Re-fetch now if the current value is older than `maxAge` milliseconds or has been invalidated. */
	async refreshStale(maxAge: number): Promise<void> {
		if (this._invalidation || this.age > maxAge) await this.refresh();
	}

	/**
	 * Abort any current in-flight fetch and pending async operation.
	 * - Sends `ABORT` to the current `AbortSignal` and clears the controller (a new signal will be created on the next read or fetch).
	 * - Clears the inflight promise or await and resets busy state.
	 * - Any pending `await()` result will be silently discarded.
	 */
	override abort(): void {
		this._aborter?.abort(ABORT);
		this._aborter = undefined;
		this._pendingRefresh = undefined;
		this.busy.value = false;
		super.abort(); // clears _pendingValue
	}

	// Implement `AsyncDisposable`.
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			() => this.abort(),
			this.busy, // Send `done: true` to any iterators of the busy store.
			super[Symbol.asyncDispose](),
		);
	}
}
