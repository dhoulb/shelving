import type { Dispatch, Handler, Stop } from "../util/function.js";
import { Deferred } from "../util/async.js";
import { runSequence } from "../util/sequence.js";
import { AbstractSequence } from "./AbstractSequence.js";

/** Used when the deferred sequence has no value or reason queued. */
const _NOVALUE: unique symbol = Symbol("shelving/DeferredSequence.NOVALUE");

/**
 * Deferred sequence of values.
 * - Implements `AsyncIterable` so values can be iterated over using `for await...of`
 * - Implements `Promise` so the next value can be awaited.
 */
export class DeferredSequence<T = void, R = void> extends AbstractSequence<T, R> implements Promise<T> {
	/**
	 * Next deferred to be rejected/resolved, or `undefined` if we haven't requested one yet..
	 * - Only create the deferred on demand, because we don't want to reject a deferred that isn't used to or it would throw an unhandled promise error.
	 */
	private _deferred: Deferred<T> | undefined;

	/** Get the next promise to be deferred/rejected. */
	get value(): Promise<T> {
		return (this._deferred ||= new Deferred<T>());
	}

	/** Resolve the current deferred in the sequence. */
	readonly resolve = (value: T): void => {
		this._nextValue = value;
		this._nextReason = _NOVALUE;
		queueMicrotask(this._fulfill);
	};
	private _nextValue: T | typeof _NOVALUE = _NOVALUE;

	/** Reject the current deferred in the sequence. */
	readonly reject = (reason: Error | unknown): void => {
		this._nextValue = _NOVALUE;
		this._nextReason = reason;
		queueMicrotask(this._fulfill);
	};
	private _nextReason: Error | unknown | typeof _NOVALUE = _NOVALUE;

	/** Fulfill the current deferred by resolving or rejecting it. */
	private readonly _fulfill = () => {
		const { _deferred, _nextReason, _nextValue } = this;
		this._deferred = undefined;
		this._nextReason = _NOVALUE;
		this._nextValue = _NOVALUE;
		if (_deferred) {
			if (_nextReason !== _NOVALUE) _deferred.reject(_nextReason);
			else if (_nextValue !== _NOVALUE) _deferred.resolve(_nextValue);
		}
	};

	// Implement `AsyncIterator`
	async next(): Promise<IteratorResult<T, R>> {
		return { value: await this.value };
	}

	// Implement `Promise`
	then<X = T, Y = never>(onNext?: (v: T) => X | PromiseLike<X>, onError?: (r: unknown) => Y | PromiseLike<Y>): Promise<X | Y> {
		return this.value.then(onNext, onError);
	}
	catch<Y>(onError: (r: unknown) => Y | PromiseLike<Y>): Promise<T | Y> {
		return this.value.catch(onError);
	}
	finally(onFinally: () => void): Promise<T> {
		return this.value.finally(onFinally);
	}

	/** Resolve the current deferred from a sequence of values. */
	async *through(sequence: AsyncIterable<T>): AsyncIterable<T> {
		for await (const item of sequence) {
			this.resolve(item);
			yield item;
		}
	}

	/** Pull values from a source sequence until the returned stop function is called. */
	from(source: AsyncIterable<T>, onError?: Handler): Stop {
		return runSequence(this.through(source), undefined, onError);
	}

	/** Subscrbe to the value of the sequence with a callback until the returned stop function is called. */
	to(onNext: Dispatch<[T]>, onError?: Handler): Stop {
		return runSequence(this, onNext, onError);
	}
}