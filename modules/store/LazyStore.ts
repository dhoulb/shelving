import type { NONE } from "../util/constants.js";
import { type StartCallback, type StopCallback, call } from "../util/callback.js";
import { Store } from "./Store.js";

/** Store that starts/stops a source subscription when things subscribe to it, and stops when everything has unsubscribed from it. */
export class LazyStore<T> extends Store<T> implements Disposable {
	constructor(start: StartCallback<Store<T>>, value: T | typeof NONE, time?: number) {
		super(value, time);
		this._start = start;
	}

	// Override to subscribe to start/stop the source subscription when things subscribe to this.
	override async *[Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
		this.start();
		this._iterating++;
		try {
			yield* super[Symbol.asyncIterator]();
		} finally {
			this._iterating--;
			if (this._iterating < 1) this.stop();
		}
	}
	private _iterating = 0;

	/** Start subscription to `MemoryProvider` if there is one. */
	start() {
		if (!this._stop) this._stop = this._start(this);
	}
	private _start: StartCallback<Store<T>>;

	/** Stop subscription to `MemoryProvider` if there is one. */
	stop() {
		if (this._stop) this._stop = void call(this._stop);
	}
	private _stop: StopCallback | undefined = undefined;

	// Implement `Disposable`
	[Symbol.dispose](): void {
		this.stop();
	}
}
