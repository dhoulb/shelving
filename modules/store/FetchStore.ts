import { RequiredError } from "../error/RequiredError.js";
import type { NONE } from "../util/constants.js";
import { awaitDispose } from "../util/dispose.js";
import { BooleanStore } from "./BooleanStore.js";
import { Store } from "./Store.js";

/** Callback for a callback fetch store. */
export type FetchCallback<T> = () => PromiseLike<T>;

const _ABORTED = Symbol();

/**
 * Store that fetches its values from a remote source.
 *
 * @param value The initial value for the store, or `NONE` if it does not have one yet.
 * @param callback An optional callback that, if set, will be called when the `fetch()` method is invoked to fetch the next value.
 */
export class FetchStore<T> extends Store<T> {
	/**
	 * Store that indicates the busy state of this store.
	 * - Can be listened to for e.g. loading spinners etc.
	 */
	readonly busy = new BooleanStore(true);

	// Override to possibly trigger a fetch when `this.loading` is read.
	// This is because when we check `store.loading` in a component we are signalling intent that we wish to use that value.
	override get loading(): boolean {
		const loading = super.loading;
		if (loading || this._invalidation) void this.refresh();
		return loading;
	}

	// Override to possibly trigger a fetch if `this.value` is still in a loading state or is invalid.
	// This is because when we check `store.loading` in a component we are signalling intent that we wish to use that value.
	override get value(): T {
		if (super.loading) void this.refresh();
		return super.value;
	}
	override set value(value: T | typeof NONE) {
		super.value = value;

		// Setting a value resets in the invalid state.
		this._invalidation = 0;
	}

	// Override to save callback.
	constructor(value: T | typeof NONE, callback?: FetchCallback<T>) {
		super(value);
		this._callback = callback;
	}

	/**
	 * Fetch the result for this endpoint now.
	 * - Triggered automatically when someone reads `value` or `loading`
	 * - Multiple requests to `fetch()` while one is inflight will return the same promise.
	 *
	 * @throws {never} Never throws so safe to call unhandled.
	 */
	refresh(): Promise<void> {
		return (this._inflight ||= this._refresh());
	}

	/** An in-flight refresh, so we don't de-duplicate these. */
	private _inflight: Promise<void> | undefined = undefined;

	/** Kick off a refresh. */
	private async _refresh() {
		try {
			await this.await(this._fetch());
		} finally {
			this._inflight = undefined;
		}
	}

	// Override to start/stop `this.busy` when awaiting values, and handle aborts correctly.
	override async await(value: PromiseLike<T>): Promise<void> {
		this.busy.value = true;
		this._awaits.add(value);
		try {
			// Capture the invalidation number before the change.
			const invalidation = this._invalidation;

			// Use super.value to set the value directly without resetting the invalidation number.
			super.value = await value;

			// If this store was not invalidated while awaiting the value (i.e. invalidation number did not change) then reset the invalidation number.
			if (invalidation === this._invalidation) this._invalidation = 0;
		} catch (thrown) {
			// If the throw was not an on-purpose abort, save it as the reason.
			if (thrown !== _ABORTED) this.reason = thrown;
		} finally {
			this._awaits.delete(value);
			if (!this._awaits.size) this.busy.value = false;
			this._controller = undefined;
		}
	}
	private _awaits = new Set(); // Used to only set `busy` when we have no awaited values left.

	/** Call the callback with the current payload. */
	protected _fetch(): PromiseLike<T> {
		if (!this._callback) throw new RequiredError("FetchStore has no callback() function", { store: this, caller: this.refresh });
		return this._callback();
	}
	private _callback: FetchCallback<T> | undefined;

	/** Invalidate this endpoint, so a new fetch is triggered next time `this.value` is called. */
	invalidate(): void {
		this.abort();
		this._invalidation++;
	}
	private _invalidation = 0; // Used to track the "invalidation number" which increments on each invalidation and

	/** Re-fetch the result now if the current value is older than `maxAge` millisecond or has been invalidated. */
	async refreshStale(maxAge: number): Promise<void> {
		if (this._invalidation || this.age > maxAge) await this.refresh();
	}

	/**
	 * Create or get an `AbortSignal` that can be used to cancel an in-flight fetch for this store.
	 * - implementation code or subclasses can use this signal when fetching to cancel the most recent request
	 * - The signal will be reset whenever a fetch completes or a new fetch starts.
	 */
	get signal(): AbortSignal {
		return (this._controller ||= new AbortController()).signal;
	}
	private _controller: AbortController | undefined;

	/** Abort the current signal now. */
	abort() {
		const controller = this._controller;
		if (controller) {
			controller.abort(_ABORTED);
			this._controller = undefined;
		}
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
