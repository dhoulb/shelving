import { awaitDispose } from "../util/dispose.js";
import { type StartCallback, Starter } from "../util/start.js";
import { DeferredSequence } from "./DeferredSequence.js";

/** Deferred sequence of values that calls a `StartCallback` when it has iterators that are iterating, and calls the corresponding `StopCallback` when all iterators have finished. */
export class LazyDeferredSequence<T = void, R = void, N = void> extends DeferredSequence<T, R, N> {
	private _iterating = 0;
	private _starter: Starter<[DeferredSequence<T, R, N>]>;
	constructor(start: StartCallback<[DeferredSequence<T, R, N>]>) {
		super();
		this._starter = new Starter(start);
	}
	override async *[Symbol.asyncIterator](): AsyncGenerator<T, R | undefined, N | undefined> {
		this._starter.start(this);
		this._iterating++;
		try {
			return yield* super[Symbol.asyncIterator]();
		} finally {
			this._iterating--;
			if (this._iterating < 1) this._starter.stop();
		}
	}
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			this._starter, // Stop the starter.
			super[Symbol.asyncDispose](),
		);
	}
}
