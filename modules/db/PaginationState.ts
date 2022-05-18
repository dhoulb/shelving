import { getLastItem, assertNumber, Results, Entry, yieldMerged, Entries, getMap, Data, LOADING, assertMax } from "../util/index.js";
import { BooleanState, State } from "../stream/index.js";
import { ConditionError } from "../index.js";
import { QueryReference } from "./Database.js";

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class PaginationState<T extends Data> extends State<Results<T>> implements Iterable<Entry<T>> {
	/** Whether this pagination is currently loading results. */
	readonly busy = new BooleanState();

	/** Reference to the query this pagination is paginating. */
	readonly ref: QueryReference<T>;

	/** Limit set on this pagination's query. */
	readonly limit: number;

	constructor(ref: QueryReference<T>) {
		super();
		this.ref = ref;
		assertNumber(ref.limit); // Collection must have a numeric limit to paginate (otherwise you'd be retrieving the entire set of documents).
		assertMax(ref.sorts.size, 1); // Collection must have at least one sort order to paginate.
		this.limit = ref.limit;
	}

	/**
	 * Load more results after the end.
	 * - Promise that needs to be handled.
	 */
	more = async (): Promise<void> => {
		if (this.closed) throw new ConditionError("Pagination is closed");
		if (!this.busy.value) {
			this.busy.next(true);
			if (!this.exists) {
				// First set of results.
				this._value === LOADING;
				const next = await this.ref.results;
				this.next(next);
				if (next.size < this.limit) this.complete();
				this.busy.next(false);
			} else {
				// Additional set of results.
				const lastItem = getLastItem(this.value);
				if (lastItem) {
					const next = await this.ref.after(lastItem[0], lastItem[1]).results;
					this.merge(next);
					if (next.size < this.limit) this.complete();
					this.busy.next(false);
					return;
				}
			}
		}
	};

	/**
	 * Merge more results into this pagination.
	 * @return The change in the number of results.
	 */
	merge(more: Entries<T>): void {
		this.next(this.exists ? getMap(this.ref.sorts.transform(yieldMerged(more, this.value))) : getMap(more));
	}

	/** Iterate over the entries of the values currently in the pagination. */
	[Symbol.iterator](): Iterator<Entry<T>> {
		return this.value[Symbol.iterator]();
	}
}
