import { UnexpectedError } from "../error/UnexpectedError.js";
import { getGetter } from "../util/class.js";
import type { Mutable } from "../util/object.js";
import { ThroughIterator } from "./ThroughIterator.js";

/** Used when the sequence hasn't inspected anything yet. */
const _NOVALUE: unique symbol = Symbol("shelving/InspectGenerator.NOVALUE");

/**
 * Iterable that inspects a source iterable as it iterates.
 * - Stores: first/last yielded value, returned value, whether iteration is done, the number of items that were iterated.
 *
 * @example
 * 	const watch = new InspectIterator(iterable);
 * 	for (const next of capture) console.log("YIELDED", next);
 * 	console.log("FIRST", watch.first);
 * 	console.log("RETURNED", watch.returned);
 */
export class InspectIterator<T, R, N> extends ThroughIterator<T, R, N> implements Iterator<T, R, N>, Iterable<T, R, N> {
	/** Get the number of results received by this iterator so far. */
	readonly count = 0;

	/** Is the iteration done? */
	readonly done: boolean = false;

	/** The first yielded value (throws if the iteration yielded no values, i.e. `this.count === 0`). */
	get first(): T {
		if (this._first === _NOVALUE)
			throw new UnexpectedError("Iteration not started", {
				iterator: this,
				caller: getGetter(this, "first"),
			});
		return this._first;
	}
	private _first: T | typeof _NOVALUE = _NOVALUE;

	/** The last yielded value (throws if the iteration yielded no values, i.e. `this.count === 0`). */
	get last(): T {
		if (this._last === _NOVALUE)
			throw new UnexpectedError("Iteration not started", {
				iterator: this,
				caller: getGetter(this, "last"),
			});
		return this._last;
	}
	private _last: T | typeof _NOVALUE = _NOVALUE;

	/** The returned value (throws if the iteration is not done, i.e. `this.done === false`). */
	get returned(): R {
		if (this._returned === _NOVALUE)
			throw new UnexpectedError("Iteration not done", {
				iterator: this,
				caller: getGetter(this, "returned"),
			});
		return this._returned;
	}
	private _returned: R | typeof _NOVALUE = _NOVALUE;

	// Override to watch returned values.
	override next(value: N): IteratorResult<T, R> {
		return this._inspect(this.next(value));
	}
	override throw(thrown: unknown): IteratorResult<T, R> {
		return this._inspect(this.throw(thrown));
	}
	override return(value: R): IteratorResult<T, R> {
		return this._inspect(this.return(value));
	}

	/** Capture a result. */
	private _inspect(result: IteratorResult<T, R>): IteratorResult<T, R> {
		if (!result.done) {
			if (this.first === undefined) this._first = result.value;
			this._last = result.value;
			(this as Mutable<this>).count++;
		} else {
			this._returned = result.value;
			(this as Mutable<this>).done = true;
		}
		return result;
	}
}
