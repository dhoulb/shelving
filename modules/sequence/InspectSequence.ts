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
 */
export class InspectSequence<T, R, N> extends ThroughSequence<T, R, N> {
	/** Get the number of results received by this iterator so far. */
	get count() {
		return this._count;
	}
	private _count = 0;

	/** Is the iteration done? */
	get done() {
		return this._done;
	}
	private _done: boolean = false;

	/** The first yielded value (throws if the iteration yielded no values, i.e. `this.count === 0`). */
	get first(): T {
		if (this._first === _NOVALUE)
			throw new UnexpectedError("Iteration not started", {
				sequence: this,
				caller: getGetter(this, "first"),
			});
		return this._first;
	}
	private _first: T | typeof _NOVALUE = _NOVALUE;

	/** The last yielded value (throws if the iteration yielded no values, i.e. `this.count === 0`). */
	get last(): T {
		if (this._last === _NOVALUE)
			throw new UnexpectedError("Iteration not started", {
				sequence: this,
				caller: getGetter(this, "last"),
			});
		return this._last;
	}
	private _last: T | typeof _NOVALUE = _NOVALUE;

	/** The returned value (throws if the iteration is not done, i.e. `this.done === false`). */
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
	override async next(value?: N | undefined): Promise<IteratorResult<T, R | undefined>> {
		return this._inspect(await super.next(value));
	}
	override async return(value?: R | undefined | PromiseLike<R | undefined>): Promise<IteratorResult<T, R | undefined>> {
		return this._inspect(await super.return(value));
	}
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
