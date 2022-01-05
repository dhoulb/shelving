import type { Observer } from "../util/index.js";
import { State } from "./State.js";

/**
 * State that tidies up after itself by completing itself after all its subscribers unsubscribe.
 * @param delay How long to wait (in ms) before the source subscription is stopped.
 */
export class LazyState<T> extends State<T> {
	private _delay: number;
	private _timeout?: NodeJS.Timeout;
	constructor(delay = 0) {
		super();
		this._delay = delay;
	}
	// Override to stop the source subscription when the last subscriber unsubscribes.
	override _removeObserver(observer: Observer<T>): void {
		super._removeObserver(observer);
		if (this._delay) {
			// Maybe stop in a bit (if there are still no subscribers).
			if (this._timeout) clearTimeout(this._timeout);
			this._timeout = setTimeout(() => {
				if (!this._observers.size && !this.closed) this.complete();
			}, this._delay);
		} else {
			// Stop now.
			if (!this._observers.size && !this.closed) this.complete();
		}
	}
}
