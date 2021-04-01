import { getFirstItem, getLastItem } from "../array";
import { assert, assertLength } from "../assert";
import { Data, Results } from "../data";
import { Collection } from "../db";
import { Entry, ImmutableEntries } from "../entry";
import { EmptyDispatcher } from "../function";
import { Sorts } from "../query";
import { State } from ".";

type PaginationValue<T extends Data> = {
	loading: boolean;
	done: boolean;
	entries: ImmutableEntries<T>;
	backward: EmptyDispatcher;
	forward: EmptyDispatcher;
};

/**
 * State that wraps a `Collection` to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<T extends Data> extends State<PaginationValue<T>> {
	/**
	 * Create a new `Pagination` instance.
	 * - Static function so you can use it with `useLazy()` and for consistency with `State`
	 */
	static for<X extends Data>(collection: Collection<X>, initial?: Results<X>): Pagination<X> {
		return new Pagination<X>(collection, initial);
	}

	private _results: Results<T>; // Cached current set of results.

	/** Collection this pagination is based on. */
	readonly collection: Collection<T>;

	/** Limit of the collection's query. */
	readonly limit: number;

	/** Sorts of the collection's query. */
	readonly sorts: Sorts<T>;

	// Protected to encourage `Pagination.for()`
	protected constructor(collection: Collection<T>, initial?: Results<T>) {
		const { slice, sorts } = collection.query;
		assert(slice.limit, slice.limit); // Collection must have a limit to paginate (otherwise you'd just get the result normally).
		assertLength(sorts, 1, Infinity); // Collection must have at least one sort order to paginate.

		const results = initial || {};
		const entries = Object.entries(results);
		super({
			loading: initial ? false : true,
			done: initial ? entries.length < slice.limit : false,
			entries,
			backward: () => this.backward(),
			forward: () => this.forward(),
		});
		this._results = results;
		this.collection = collection;
		this.limit = slice.limit;
		this.sorts = sorts;

		// Automatically load more results if there were no initial results.
		if (!initial) void this._more(); // Call `_more()` directly to skip loading check.
	}

	/** Load more results before the start. */
	backward(): void {
		const { loading, done, entries } = this.value;
		if (!loading && !done) void this._more("before", getFirstItem(entries));
	}

	/** Load more results after the end. */
	forward(): void {
		const { loading, done, entries } = this.value;
		if (!loading && !done) void this._more("after", getLastItem(entries));
	}

	private async _more(offset: "after" | "before" = "after", entry?: Entry<T>): Promise<void> {
		this.update({ loading: true });
		const offsetCollection = entry ? this.collection[offset](...entry) : this.collection;
		this.merge(await offsetCollection.results);
		this.update({ loading: false });
	}

	/**
	 * Merge more results to the pagination.
	 * - If the number of results in `moreResults` is less than `this.limit`, the pagination is considered to be done.
	 * - The results are sorted when they're added, so whether they're prepended or appended doesn't matter.
	 */
	merge(moreResults: Results<T>): void {
		const moreCount = Object.keys(moreResults).length;

		if (!moreCount) {
			this.update({ done: true });
		} else {
			this._results = { ...this._results, ...moreResults };
			const entries = Object.entries(this._results);
			this.sorts.apply(entries);
			this.update({ entries, done: moreCount < this.limit });
		}
	}
}
