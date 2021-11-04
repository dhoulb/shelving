import type { LOADING, Observer, Resolvable } from "../util/index.js";
import { State } from "./State.js";

/**
 * State that tidies up after itself by completing itself after all its subscribers unsubscribe.
 * @param delay How long to wait (in ms) before the source subscription is stopped.
 */
export class LazyState<T> extends State<T> {
	private _delay: number;
	private _timeout?: NodeJS.Timeout;
	constructor(initial: Resolvable<T> | typeof LOADING, delay = 0) {
		super(initial);
		this._delay = delay;
	}
	// Override to stop the source subscription when the last subscriber unsubscribes.
	override off(observer: Observer<T>): void {
		super.off(observer);
		if (this._delay) {
			// Maybe stop in a bit (if there are still no subscribers).
			if (this._timeout) clearTimeout(this._timeout);
			this._timeout = setTimeout(() => {
				if (!this._subscribers.length && !this.closed) this.complete();
			}, this._delay);
		} else {
			// Stop now.
			if (!this._subscribers.length && !this.closed) this.complete();
		}
	}
}
