import { RequiredError } from "../error/RequiredError.js";
import { isAsync } from "../util/async.js";
import { ABORTED, NONE } from "../util/constants.js";
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
export class FetchStore<T> extends Store<T> {
	/**
	 * Store that indicates the busy state of this store.
	 * - `true` while a refresh is in-flight, `false` otherwise.
	 * - Can be subscribed to for e.g. loading spinners.
	 */
	readonly busy: BooleanStore;

	// Override to possibly trigger a fetch when `this.loading` is read.
	// Reading `loading` signals intent to use the value, so we start a fetch if needed.
	override get loading(): boolean {
		const loading = super.loading;
		if (loading || this._invalidation) void this.refresh();
		return loading;
	}

	// Override to possibly trigger a fetch if `this.value` is still loading.
	// Reading `value` signals intent to use the value, so we start a fetch if needed.
	override get value(): T {
		if (super.loading) void this.refresh();
		return super.value;
	}
	override set value(value: T | typeof NONE | PromiseLike<T | typeof NONE>) {
		super.value = value; // calls Store.set value() which calls this.abort() then _applyValue()

		// Setting a value resets the invalid state.
		this._invalidation = 0;
	}

	constructor(value: T | typeof NONE, callback?: FetchCallback<T>) {
		super(value);
		this.busy = new BooleanStore(value === NONE);
		this._callback = callback;
	}

	/**
	 * Fetch the result for this store now.
	 * - Triggered automatically when someone reads `value` or `loading`.
	 * - Concurrent calls while a fetch is in-flight return the same promise (deduplication).
	 * - Never throws — errors are stored as `reason`.
	 *
	 * @returns `true` if the fetch completed and the value was applied, `false` if aborted or superseded.
	 * @returns Synchronous `boolean` if the callback returned a synchronous value.
	 */
	refresh(): Promise<boolean> | boolean {
		if (this._inflight) return this._inflight;
		// Cancel any existing controller and create a fresh one for this fetch.
		this._controller?.abort(ABORTED);
		this._controller = new AbortController();
		try {
			const value = this._fetch(this._controller.signal);
			if (isAsync(value)) return (this._inflight = this._refresh(value));
			this.value = value;
			return true;
		} catch (thrown) {
			this.reason = thrown;
			return false;
		}
	}
	private _inflight: Promise<boolean> | undefined = undefined;
	private async _refresh(asyncValue: PromiseLike<T>): Promise<boolean> {
		this.busy.value = true;
		try {
			const refreshed = await this.await(asyncValue);
			if (refreshed) this._invalidation = 0;
			return refreshed;
		} finally {
			this.busy.value = false;
			this._inflight = undefined;
		}
	}

	/**
	 * Current `AbortSignal` for this store's in-flight fetch.
	 * - Created lazily; a new signal is issued each time `refresh()` starts a new fetch or `abort()` is called.
	 */
	get signal(): AbortSignal {
		return (this._controller ||= new AbortController()).signal;
	}
	private _controller: AbortController | undefined;

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
	 * - Also aborts any current in-flight fetch.
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
	 * - Aborts the current `AbortSignal` and clears the controller (a new signal will be created on the next read or fetch).
	 * - Clears the in-flight promise and resets busy state.
	 * - Any pending `await()` result will be silently discarded.
	 */
	override abort(): void {
		this._controller?.abort(ABORTED);
		this._controller = undefined;
		this._inflight = undefined;
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
