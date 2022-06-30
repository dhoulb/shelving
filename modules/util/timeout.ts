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
	private _ms: number;
	private _timeout: NodeJS.Timeout | undefined = undefined;
	constructor(ms = 0) {
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
	set(callback: () => void, ms: number = this._ms): void {
		this.clear();
		this._timeout = setTimeout(() => {
			this._timeout = undefined;
			callback();
		}, ms);
	}

	/** Cancel any existing timeout.. */
	clear(): void {
		if (this._timeout) this._timeout = void clearTimeout(this._timeout);
	}
}
