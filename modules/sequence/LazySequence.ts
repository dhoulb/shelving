import { awaitDispose } from "../util/dispose.js";
import { type StartCallback, Starter } from "../util/start.js";
import { ThroughSequence } from "./ThroughSequence.js";

/** Sequence of values that calls a `StartCallback` when it has iterators that are iterating, and calls the corresponding `StopCallback` when all iterators have finished. */
export class LazySequence<T = void, R = void, N = void> extends ThroughSequence<T, R, N> implements AsyncDisposable {
	private _iterators = new Set<LazyIterator<T, R, N>>(); // Keep track of the iterators that are iterating.
	private _starter: Starter;

	/** Get the number of iterators currently registered. */
	get iterators(): number {
		return this._iterators.size;
	}

	constructor(source: AsyncIterator<T, R, N>, start: StartCallback) {
		super(source);
		this._starter = new Starter(start);
	}

	// Implement `AsyncIterable`
	override [Symbol.asyncIterator]() {
		// Just returns a new iterator.
		return new LazyIterator(this);
	}

	// Implement `AsyncDisposable`
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			this._starter, // Stop the starter.
			super[Symbol.asyncDispose](),
		);
	}

	/**
	 * An iterator started iterating.
	 * - Add this iterator to the register.
	 * - Start the starter if this is the first iterator.
	 */
	start(iterator: LazyIterator<T, R, N>) {
		const before = this._iterators.size;
		this._iterators.add(iterator);
		if (before === 0 && this._iterators.size === 1) this._starter.start();
	}

	/**
	 * An iterator stopped iterating.
	 * - Add this iterator to the register
	 * - Stop the starter if this is the last iterator.
	 */
	stop(iterator: LazyIterator<T, R, N>) {
		const before = this._iterators.size;
		this._iterators.delete(iterator);
		if (before === 1 && this._iterators.size === 0) this._starter.stop();
	}
}

/** Internal `Iterator` that allows the lazy sequence to work. */
class LazyIterator<T, R, N> implements AsyncIterator<T, R | undefined, N | undefined> {
	private _sequence: LazySequence<T, R | undefined, N | undefined>;
	constructor(sequence: LazySequence<T, R | undefined, N | undefined>) {
		this._sequence = sequence;
	}
	next(value?: N | undefined): Promise<IteratorResult<T, R | undefined>> {
		this._sequence.start(this); // Iterator has started iterating.
		return this._result(this._sequence.next(value));
	}
	return(value?: R | undefined | PromiseLike<R | undefined>): Promise<IteratorResult<T, R | undefined>> {
		return this._result(this._sequence.return(value));
	}
	throw(reason?: unknown): Promise<IteratorResult<T, R | undefined>> {
		return this._result(this._sequence.throw(reason));
	}
	async _result(result: Promise<IteratorResult<T, R | undefined>>): Promise<IteratorResult<T, R | undefined>> {
		try {
			const r = await result;
			if (r.done) this._sequence.stop(this); // Iterator has stopped iterating because `done: true` was returned.
			return r;
		} catch (reason) {
			this._sequence.stop(this); // Iterator has stopped iterating because it threw.
			throw reason;
		}
	}
}
