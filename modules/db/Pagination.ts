import { getFirstItem, getLastItem, ImmutableEntries, bindMethod, assertLength, Data, Results, assertNumber } from "../util/index.js";
import { Sorts } from "../query/index.js";
import { State } from "../stream/index.js";
import { Documents } from "./Documents.js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const EMPTY_RESULTS: Results<any> = {};

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class PaginationState<T extends Data> extends State<ImmutableEntries<T>> {
	#results: Results<T>; // Cached current set of results.

	/** Documents ref this pagination is based on. */
	readonly ref: Documents<T>;

	/** Limit of the collection's query. */
	readonly limit: number;

	/** Sorts of the collection's query. */
	readonly sorts: Sorts<T>;

	constructor(ref: Documents<T>, results: Results<T> = EMPTY_RESULTS) {
		super(Object.entries(results));
		this.#results = results;

		const { slice, sorts } = ref.query;
		assertNumber(slice.limit); // Collection must have a numeric limit to paginate (otherwise you'd be retrieving the entire set of documents).
		assertLength(sorts, 1, Infinity); // Collection must have at least one sort order to paginate.
		this.ref = ref;
		this.limit = slice.limit;
		this.sorts = sorts;

		if (results === EMPTY_RESULTS) {
			// Automatically load more results if initial results was `undefined`
			this.next(this.#mergeReference(ref));
		} else {
			// Automatically complete the pagination if there are fewer entries than the slice limit.
			if (this.value.length < this.limit) void this.complete();
		}
	}

	/** Load more results before the start. */
	@bindMethod
	backward(): void {
		if (!this.pending && !this.closed) {
			const entry = getFirstItem(this.value);
			this.next(this.#mergeReference(entry ? this.ref.before(...entry) : this.ref));
		}
	}

	/** Load more results after the end. */
	@bindMethod
	forward(): void {
		if (!this.pending && !this.closed) {
			const entry = getLastItem(this.value);
			this.next(this.#mergeReference(entry ? this.ref.after(...entry) : this.ref));
		}
	}

	/**
	 * Merge more results to the pagination.
	 * - If the number of results in `moreResults` is less than `this.limit`, the pagination is considered to be done.
	 * - The results are sorted when they're added, so whether they're prepended or appended doesn't matter.
	 */
	merge(moreResults: Results<T>): void {
		this.next(this.#mergeResults(moreResults));
	}

	/** Get the result of merging our current results with some new results loaded from a `Documents` reference. */
	async #mergeReference(ref: Documents<T>): Promise<ImmutableEntries<T>> {
		return this.#mergeResults(await ref.get());
	}

	/** Get the result of merging our current results and some new results. */
	#mergeResults(moreResults: Results<T>): ImmutableEntries<T> {
		const moreCount = Object.keys(moreResults).length;
		if (!moreCount) {
			this.complete();
			return this.value;
		} else {
			this.#results = { ...this.#results, ...moreResults };
			const entries: ImmutableEntries<T> = Object.entries(this.#results);
			this.sorts.apply(entries);
			this.next(entries);
			if (moreCount < this.limit) this.complete(); // Automatically complete the pagination if there are fewer entries than the slice limit.
			return entries;
		}
	}
}
