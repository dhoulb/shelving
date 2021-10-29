import type { Observer } from "../util/index.js";
import { Stream, StreamSource } from "./Stream.js";

/**
 * Stream that tidies up after itself by completing itself after all its subscribers unsubscribe.
 * @param delay How long to wait (in ms) before the source subscription is stopped.
 */
export class TidyStream<X> extends Stream<X, X> {
	private _delay: number;
	private _timeout?: NodeJS.Timeout;
	constructor(source: StreamSource<X>, delay = 0) {
		super(source);
		this._delay = delay;
	}
	// Override to stop the source subscription when the last subscriber unsubscribes.
	override off(observer: Observer<X>): void {
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
