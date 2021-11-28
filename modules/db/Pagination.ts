import { getFirstItem, getLastItem, assertLength, Results, assertNumber, Datas, Key, ImmutableMap, Entry, yieldMerged } from "../util/index.js";
import { AbstractState, StreamClosedError } from "../stream/index.js";
import { DatabaseQuery } from "./Database.js";

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<D extends Datas, C extends Key<D>> extends AbstractState<Results<D[C]>, ImmutableMap<D[C]>> implements Iterable<Entry<D[C]>> {
	protected _pending = false;
	readonly ref: DatabaseQuery<D, C>;

	constructor(ref: DatabaseQuery<D, C>) {
		super();
		this.ref = ref;
		assertNumber(ref.limit); // Collection must have a numeric limit to paginate (otherwise you'd be retrieving the entire set of documents).
		assertLength(ref.sorts, 1, Infinity); // Collection must have at least one sort order to paginate.
	}

	/**
	 * Load more results before the start.
	 * - Promise that needs to be handled.
	 */
	backward = async (): Promise<void> => {
		if (this.closed) throw new StreamClosedError();
		if (!this._pending) {
			const entry = getFirstItem(this.value);
			this._pending = true;
			this.next(await (entry ? this.ref.before(entry[0], entry[1]).results : this.ref.results));
		}
	};

	/**
	 * Load more results after the end.
	 * - Promise that needs to be handled.
	 */
	forward = async (): Promise<void> => {
		if (this.closed) throw new StreamClosedError();
		if (!this._pending) {
			const entry = getLastItem(this.value);
			this._pending = true;
			this.next(await (entry ? this.ref.after(entry[0], entry[1]).results : this.ref.results));
		}
	};

	// Dispatch doesn't just dispatch the next value, it merges it into the current results and dispatches the combined results.
	_derive(results: Results<D[C]>): void {
		this._pending = false;
		if (this.loading) {
			// Merge the results into the existing results.
			const current = this.value;
			const next = new Map(this.ref.sorts.derive(yieldMerged(this.value, results)));
			const change = next.size - current.size;
			super._dispatch(next);

			// Automatically complete the pagination if there are fewer entries than the slice limit.
			if (typeof this.ref.limit === "number" && change < this.ref.limit) this.complete();
		} else {
			super._dispatch(new Map(results));
		}
	}

	/** Iterate over the entries of the values currently in the pagination. */
	[Symbol.iterator](): Iterator<Entry<D[C]>> {
		return this.value[Symbol.iterator]();
	}
}
