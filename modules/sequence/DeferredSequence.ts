import type { Deferred } from "../util/async.js";
import { createDeferred } from "../util/async.js";
import { awaitDispose } from "../util/dispose.js";
import type { Nullable } from "../util/null.js";
import { Sequence } from "./Sequence.js";

/**
 * Result representing a rejection in a `DeferredSequence`, carrying the thrown `reason`.
 *
 * @see https://shelving.cc/sequence/DeferredErrorResult
 */
export type DeferredErrorResult = { readonly reason: unknown };

/**
 * Pending result of a `DeferredSequence` — either a standard `IteratorResult` or a `DeferredErrorResult` rejection.
 *
 * @see https://shelving.cc/sequence/DeferredResult
 */
export type DeferredResult<T, R> = IteratorResult<T, R | undefined> | DeferredErrorResult;

/**
 * Deferred sequence of values that can be async iterated and new values can be published.
 * - Implements `Deferred` so the next result can be set.
 * - Implements `Promise` so the next result can be awaited.
 * - Implements `AsyncIterable` so values can be iterated over using `for await...of`
 * - Call `resolve(value)` to publish the next value, `reject(reason?)` to publish an error, or `done(value?)` to signal completion.
 *
 * @see https://shelving.cc/sequence/DeferredSequence
 */
export class DeferredSequence<T = void, R = void, N = void> extends Sequence<T, R, N> implements Deferred<T>, Promise<T> {
	/** Lazy deferred that stores iterator values. */
	private _iteratorDeferred: Deferred<IteratorResult<T, R | undefined>> | undefined;
	/** Lazy deferred that stores promise values. */
	private _promiseDeferred: Deferred<T> | undefined;

	/** Next iterator result to reject the deferred to (on next microtask). */
	private _next: DeferredResult<T, R | undefined> | undefined;

	/**
	 * Next promise to be resolved/rejected with the upcoming value.
	 *
	 * @see https://shelving.cc/sequence/DeferredSequence/promise
	 */
	get promise(): Promise<T> {
		this._promiseDeferred ||= createDeferred();
		return this._promiseDeferred.promise;
	}

	/**
	 * Resolve the current deferred in the sequence with a value.
	 * - Sends a `{ value: X }` to any iterators.
	 *
	 * @param value Value to publish to iterators and awaiting promises.
	 * @example seq.resolve(123);
	 * @see https://shelving.cc/sequence/DeferredSequence/resolve
	 */
	resolve(value: T): void {
		this._next = { value };
		queueMicrotask(() => this._fulfill());
	}

	/**
	 * Reject the current deferred in the sequence with an error.
	 * - Sends a `{ reason: X }` to any iterators, causing `for await` loops to throw.
	 *
	 * @param reason Error or other thrown value to publish to iterators and awaiting promises.
	 * @example seq.reject(new Error("Stop"));
	 * @see https://shelving.cc/sequence/DeferredSequence/reject
	 */
	reject(reason: unknown): void {
		this._next = { reason };
		queueMicrotask(() => this._fulfill());
	}

	/**
	 * Signal that the sequence is done, causing any active `for await` loops to exit cleanly.
	 * - Sends a `{ done: true, value: R }` to any iterators.
	 *
	 * @param value Optional final return value for the sequence.
	 * @example seq.done();
	 * @see https://shelving.cc/sequence/DeferredSequence/done
	 */
	done(value?: R | undefined): void {
		this._next = { done: true, value };
		queueMicrotask(() => this._fulfill());
	}

	/**
	 * Cancel the current resolution or rejection.
	 * - Iterators will contain to wait for a next value.
	 *
	 * @example seq.cancel();
	 * @see https://shelving.cc/sequence/DeferredSequence/cancel
	 */
	cancel(): void {
		this._next = undefined;
	}

	/** Fulfill the current deferred by resolving or rejecting both the iterator deferred and the promise deferred. */
	private _fulfill() {
		const iteratorDeferred = this._iteratorDeferred;
		const promiseDeferred = this._promiseDeferred;
		const next = this._next;
		if (next) {
			this._next = undefined;
			this._iteratorDeferred = undefined;
			this._promiseDeferred = undefined;
			if ("reason" in next) {
				iteratorDeferred?.reject(next.reason);
				promiseDeferred?.reject(next.reason);
			} else {
				iteratorDeferred?.resolve(next);
				if (!next.done) promiseDeferred?.resolve(next.value);
			}
		}
	}

	/**
	 * Resolve the current deferred from a sequence of values.
	 * - Iterates `sequence`, republishing each value through this deferred sequence and yielding it on.
	 *
	 * @param sequence Source async iterable to forward values from.
	 * @returns An async iterator yielding each forwarded value.
	 * @example for await (const v of seq.through(source)) console.log(v);
	 * @see https://shelving.cc/sequence/DeferredSequence/through
	 */
	async *through(sequence: AsyncIterable<T>): AsyncIterator<T> {
		for await (const item of sequence) {
			this.resolve(item);
			yield item;
		}
	}

	// Implement `AsyncIterator` — returns the promise directly since it already resolves to IteratorResult.
	next(_next?: N | undefined): Promise<IteratorResult<T, R | undefined>> {
		this._iteratorDeferred ||= createDeferred();
		return this._iteratorDeferred.promise;
	}

	// Implement `Promise`
	then<X = T, Y = never>(
		onNext?: Nullable<(v: T) => X | PromiseLike<X>>,
		onError?: Nullable<(r: unknown) => Y | PromiseLike<Y>>,
	): Promise<X | Y> {
		return this.promise.then(onNext, onError);
	}
	catch<Y>(onError: (r: unknown) => Y | PromiseLike<Y>): Promise<T | Y> {
		return this.promise.catch(onError);
	}
	finally(onFinally: () => void): Promise<T> {
		return this.promise.finally(onFinally);
	}

	// Implement `AsyncIterable`
	override async [Symbol.asyncDispose](): Promise<void> {
		await awaitDispose(
			() => this.done(), // Send `done: true` to all consumers of this sequence.
			super[Symbol.asyncDispose](),
		);
	}
}
