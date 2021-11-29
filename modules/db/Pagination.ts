import { getFirstItem, getLastItem, assertLength, assertNumber, Datas, Key, ResultsMap, Entry, yieldMerged, Results, toMap, Mutable } from "../util/index.js";
import { State, StreamClosedError } from "../stream/index.js";
import { DatabaseQuery } from "./Database.js";

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<D extends Datas, C extends Key<D>> extends State<ResultsMap<D[C]>> implements Iterable<Entry<D[C]>> {
	readonly ref: DatabaseQuery<D, C>;
	readonly limit: number;
	readonly startLoading: boolean = false;
	readonly startDone: boolean = false;
	readonly endLoading: boolean = false;
	readonly endDone: boolean = false;

	constructor(ref: DatabaseQuery<D, C>) {
		super();
		this.ref = ref;
		assertNumber(ref.limit); // Collection must have a numeric limit to paginate (otherwise you'd be retrieving the entire set of documents).
		assertLength(ref.sorts, 1, Infinity); // Collection must have at least one sort order to paginate.
		this.limit = ref.limit;
	}

	/**
	 * Load more results before the start.
	 * - Promise that needs to be handled.
	 */
	loadStart = async (): Promise<void> => {
		if (this.closed) throw new StreamClosedError();
		if (!this.startLoading) {
			(this as Mutable<this>).startLoading = true;
			if (!this.loading) {
				const firstItem = getFirstItem(this.value);
				if (firstItem) {
					const next = await this.ref.after(firstItem[0], firstItem[1]).resultsMap;
					(this as Mutable<this>).startDone = next.size < this.limit;
					(this as Mutable<this>).startLoading = false;
					return this.merge(next);
				}
			}
			const next = await this.ref.resultsMap;
			(this as Mutable<this>).startDone = next.size < this.limit;
			(this as Mutable<this>).startLoading = false;
			return this.next(next);
		}
	};

	/**
	 * Load more results after the end.
	 * - Promise that needs to be handled.
	 */
	loadEnd = async (): Promise<void> => {
		if (this.closed) throw new StreamClosedError();
		if (!this.endLoading) {
			(this as Mutable<this>).endLoading = true;
			if (!this.loading) {
				const lastItem = getLastItem(this.value);
				if (lastItem) {
					const next = await this.ref.after(lastItem[0], lastItem[1]).resultsMap;
					(this as Mutable<this>).endDone = next.size < this.limit;
					(this as Mutable<this>).endLoading = false;
					return this.merge(next);
				}
			}
			const next = await this.ref.resultsMap;
			(this as Mutable<this>).endDone = next.size < this.limit;
			(this as Mutable<this>).endLoading = false;
			return this.next(next);
		}
	};

	/**
	 * Merge more results into this pagination.
	 * @return The change in the number of results.
	 */
	merge(more: Results<D[C]>): void {
		this.next(toMap(this.ref.sorts.derive(yieldMerged(more, this.value))));
	}

	/** Iterate over the entries of the values currently in the pagination. */
	[Symbol.iterator](): Iterator<Entry<D[C]>> {
		return this.value[Symbol.iterator]();
	}
}
