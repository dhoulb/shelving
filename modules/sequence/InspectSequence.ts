import { UnexpectedError } from "../error/UnexpectedError.js";
import { getGetter } from "../util/class.js";
import { ThroughSequence } from "./ThroughSequence.js";

/** Used when the sequence hasn't inspected anything yet. */
const _NOVALUE: unique symbol = Symbol("shelving/InspectSequence.NOVALUE");

/**
 * Sequence of values that inspects a source sequence of values as it iterates.
 * - Stores: first/last yielded value, returned value, whether iteration is done, the number of items that were iterated.
 *
 * @example
 * 	const watch = new InspectSequence(iterable);
 * 	for await (const next of capture) console.log("YIELDED", next);
 * 	console.log("FIRST", watch.first);
 * 	console.log("RETURNED", watch.returned);
 * @see https://shelving.cc/sequence/InspectSequence
 */
export class InspectSequence<T, R, N> extends ThroughSequence<T, R, N> {
	/**
	 * The number of values yielded by the source sequence so far.
	 *
	 * @see https://shelving.cc/sequence/InspectSequence/count
	 */
	get count() {
		return this._count;
	}
	private _count = 0;

	/**
	 * Whether the source sequence has finished iterating (i.e. it has returned).
	 *
	 * @see https://shelving.cc/sequence/InspectSequence/done
	 */
	get done() {
		return this._done;
	}
	private _done: boolean = false;

	/**
	 * The first value yielded by the source sequence.
	 *
	 * - Throws if the iteration yielded no values yet, i.e. `this.count === 0`.
	 *
	 * @throws {UnexpectedError} If iteration has not yielded any value yet.
	 * @see https://shelving.cc/sequence/InspectSequence/first
	 */
	get first(): T {
		if (this._first === _NOVALUE)
			throw new UnexpectedError("Iteration not started", {
				sequence: this,
				caller: getGetter(this, "first"),
			});
		return this._first;
	}
	private _first: T | typeof _NOVALUE = _NOVALUE;

	/**
	 * The last value yielded by the source sequence.
	 *
	 * - Throws if the iteration yielded no values yet, i.e. `this.count === 0`.
	 *
	 * @throws {UnexpectedError} If iteration has not yielded any value yet.
	 * @see https://shelving.cc/sequence/InspectSequence/last
	 */
	get last(): T {
		if (this._last === _NOVALUE)
			throw new UnexpectedError("Iteration not started", {
				sequence: this,
				caller: getGetter(this, "last"),
			});
		return this._last;
	}
	private _last: T | typeof _NOVALUE = _NOVALUE;

	/**
	 * The value returned by the source sequence when it finished.
	 *
	 * - Throws if the iteration is not done yet, i.e. `this.done === false`.
	 *
	 * @throws {UnexpectedError} If iteration is not done yet.
	 * @see https://shelving.cc/sequence/InspectSequence/returned
	 */
	get returned(): R | undefined {
		if (this._returned === _NOVALUE)
			throw new UnexpectedError("Iteration not done", {
				sequence: this,
				caller: getGetter(this, "returned"),
			});
		return this._returned;
	}
	private _returned: R | undefined | typeof _NOVALUE = _NOVALUE;

	// Override to watch returned values.

	/**
	 * Advance the source sequence by one step, recording the yielded or returned value.
	 *
	 * @param value Optional value passed into the source sequence's `next()`.
	 * @returns Promise resolving to the next `IteratorResult` from the source sequence.
	 * @example const { value, done } = await watch.next()
	 * @see https://shelving.cc/sequence/InspectSequence/next
	 */
	override async next(value?: N | undefined): Promise<IteratorResult<T, R | undefined>> {
		return this._inspect(await super.next(value));
	}
	/**
	 * Finish the source sequence early, recording the returned value.
	 *
	 * @param value Optional value to return from the source sequence.
	 * @returns Promise resolving to the final `IteratorResult` from the source sequence.
	 * @example await watch.return()
	 * @see https://shelving.cc/sequence/InspectSequence/return
	 */
	override async return(value?: R | undefined | PromiseLike<R | undefined>): Promise<IteratorResult<T, R | undefined>> {
		return this._inspect(await super.return(value));
	}
	/**
	 * Throw an error into the source sequence, recording the resulting value.
	 *
	 * @param reason The reason to throw into the source sequence.
	 * @returns Promise resolving to the `IteratorResult` produced after throwing.
	 * @example await watch.throw(new Error("stop"))
	 * @see https://shelving.cc/sequence/InspectSequence/throw
	 */
	override async throw(reason?: unknown): Promise<IteratorResult<T, R | undefined>> {
		return this._inspect(await super.throw(reason));
	}

	/** Capture a result. */
	private _inspect(result: IteratorResult<T, R | undefined>): IteratorResult<T, R | undefined> {
		if (!result.done) {
			if (this.first === undefined) this._first = result.value;
			this._last = result.value;
			this._count++;
		} else {
			this._returned = result.value;
			this._done = true;
		}
		return result;
	}
}
