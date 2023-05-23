import type { Callback } from "./callback.js";

/**
 * Create a new Timeout.
 *
 * Wrapper for `setTimeout()` that...
 * - Keeps track of the reference returned from `setTimeout()`
 * - Clears the any existing timeout when a new timeout is set.
 * - Allows a default delay to be set that is applied to all new timeouts that don't have a delay set.
 *
 * @param ms The default delay for any created timeouts (in ms).
 */
export class Timeout {
	private _callback: Callback | undefined;
	private _ms: number;
	private _timeout: NodeJS.Timeout | undefined = undefined;

	constructor(callback: Callback | undefined = undefined, ms = 0) {
		this._callback = callback;
		this._ms = ms;
	}

	/** Is a timeout currently set? */
	get exists(): boolean {
		return !!this._timeout;
	}

	/**
	 * Cancel any existing timeout and set a new one.
	 * @param callback
	 * @param ms The delay for this timeout (in ms).
	 */
	set(callback: Callback | undefined = this._callback, ms: number = this._ms): void {
		this.clear();
		if (callback) this._timeout = setTimeout(_executeTimeout, ms, this, callback);
	}

	/** Cancel any existing timeout.. */
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
