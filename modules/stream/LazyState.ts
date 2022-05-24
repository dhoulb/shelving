import { Observer } from "../util/observe.js";
import { Timeout } from "../util/timeout.js";
import { State } from "./State.js";

/**
 * State that tidies up after itself by completing itself after all its subscribers unsubscribe.
 * @param delay How long to wait (in ms) before the source subscription is stopped.
 */
export class LazyState<T> extends State<T> {
	private _timeout: Timeout | null;
	constructor(delay: number | null = null) {
		super();
		this._timeout = delay ? new Timeout(delay) : null;
	}
	// Override to stop the source subscription when the last subscriber unsubscribes.
	override _removeObserver(observer: Observer<T>): void {
		super._removeObserver(observer);
		if (this._timeout) {
			// Maybe stop in a bit (if there are still no subscribers).
			this._timeout.set(() => {
				if (!this._observers.size && !this.closed) this.complete();
			});
		} else {
			// Stop now.
			if (!this._observers.size && !this.closed) this.complete();
		}
	}
}
