import type { Callback } from "./function.js";

/**
 * Stateful wrapper around `setTimeout()` that manages a single pending timeout at a time.
 * - Keeps track of the reference returned from `setTimeout()`.
 * - Clears any existing timeout when a new timeout is set.
 * - Allows a default callback and a default delay to be set that are applied to all new timeouts that don't specify their own.
 *
 * @example
 * const timeout = new Timeout(() => console.log("fired"), 1000);
 * timeout.set(); // Fires the callback after 1000ms.
 * timeout.clear(); // Cancels it before it fires.
 * @see https://shelving.cc/util/timeout/Timeout
 */
export class Timeout {
	private _callback: Callback | undefined;
	private _ms: number;
	private _timeout: NodeJS.Timeout | undefined = undefined;

	/**
	 * Create a new `Timeout`.
	 *
	 * @param callback The default callback to run when a timeout fires (used by `set()` when no callback is passed).
	 * @param ms The default delay for any created timeouts (in ms).
	 * @example new Timeout(() => console.log("fired"), 1000)
	 * @see https://shelving.cc/util/timeout/Timeout
	 */
	constructor(callback: Callback | undefined = undefined, ms = 0) {
		this._callback = callback;
		this._ms = ms;
	}

	/**
	 * Whether a timeout is currently pending.
	 *
	 * @see https://shelving.cc/util/timeout/Timeout/exists
	 */
	get exists(): boolean {
		return !!this._timeout;
	}

	/**
	 * Cancel any existing timeout and set a new one.
	 *
	 * @param callback The callback to run when this timeout fires (defaults to the callback passed to the constructor).
	 * @param ms The delay for this timeout (in ms, defaults to the delay passed to the constructor).
	 * @returns Nothing.
	 * @example timeout.set(() => console.log("fired"), 500);
	 * @see https://shelving.cc/util/timeout/Timeout/set
	 */
	set(callback: Callback | undefined = this._callback, ms: number = this._ms): void {
		this.clear();
		if (callback) this._timeout = setTimeout(_executeTimeout, ms, this, callback);
	}

	/**
	 * Cancel any existing timeout.
	 *
	 * @returns Nothing.
	 * @example timeout.clear();
	 * @see https://shelving.cc/util/timeout/Timeout/clear
	 */
	clear(): void {
		const timeout = this._timeout;
		if (timeout) {
			this._timeout = undefined;
			clearTimeout(timeout);
		}
	}
}

/** Actually execute the timeout. */
function _executeTimeout(timeout: Timeout, callback: Callback) {
	timeout.clear();
	callback();
}
