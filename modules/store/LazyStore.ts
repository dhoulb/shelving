import type { NONE } from "../util/constants.js";
import { type Start, Starter } from "../util/start.js";
import { Store } from "./Store.js";

/** Store that starts/stops a source subscription when things subscribe to it, and stops when everything has unsubscribed from it. */
export class LazyStore<T> extends Store<T> implements Disposable {
	private _iterating = 0;
	private readonly _starter: Starter<[Store<T>]>;
	constructor(start: Start<[Store<T>]>, value: T | typeof NONE, time?: number) {
		super(value, time);
		this._starter = new Starter(start);
	}
	override async *[Symbol.asyncIterator](): AsyncGenerator<T, void, void> {
		this._starter.start(this);
		this._iterating++;
		try {
			yield* super[Symbol.asyncIterator]();
		} finally {
			this._iterating--;
			if (this._iterating < 1) this._starter.stop();
		}
	}
	[Symbol.dispose](): void {
		this._starter[Symbol.dispose]();
	}
}
