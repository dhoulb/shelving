import { getLastItem, assertNumber, ResultsMap, Entry, yieldMerged, Results, toMap, Data, LOADING, assertMaximum } from "../util/index.js";
import { State } from "../stream/index.js";
import { ConditionError } from "../index.js";
import { DataQuery } from "./Database.js";

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<T extends Data> extends State<ResultsMap<T>> implements Iterable<Entry<T>> {
	protected _pending = false; // Prevents double-loading.

	readonly ref: DataQuery<T>;
	readonly limit: number;

	constructor(ref: DataQuery<T>) {
		super();
		this.ref = ref;
		assertNumber(ref.limit); // Collection must have a numeric limit to paginate (otherwise you'd be retrieving the entire set of documents).
		assertMaximum(ref.sorts.size, 1); // Collection must have at least one sort order to paginate.
		this.limit = ref.limit;
	}

	/**
	 * Load more results after the end.
	 * - Promise that needs to be handled.
	 */
	more = async (): Promise<void> => {
		if (this.closed) throw new ConditionError("Pagination is closed");
		if (!this._pending) {
			this._pending = true;
			if (!this.loading) {
				const lastItem = getLastItem(this.value);
				if (lastItem) {
					const next = await this.ref.after(lastItem[0], lastItem[1]).resultsMap;
					this.merge(next);
					if (next.size < this.limit) this.complete();
					this._pending = false;
					return;
				}
			}
			this._value === LOADING;
			const next = await this.ref.resultsMap;
			this.next(next);
			if (next.size < this.limit) this.complete();
			this._pending = false;
		}
	};

	/**
	 * Merge more results into this pagination.
	 * @return The change in the number of results.
	 */
	merge(more: Results<T>): void {
		this.next(toMap(this.ref.sorts.transform(yieldMerged(more, this.value))));
	}

	/** Iterate over the entries of the values currently in the pagination. */
	[Symbol.iterator](): Iterator<Entry<T>> {
		return this.value[Symbol.iterator]();
	}
}
