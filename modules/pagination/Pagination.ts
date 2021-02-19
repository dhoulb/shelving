import { getFirstItem, getLastItem } from "../array";
import { assert, assertLength } from "../assert";
import { Data, Results } from "../data";
import { Collection } from "../db";
import { ImmutableEntries } from "../entry";
import { EmptyDispatcher } from "../function";
import { Sorts } from "../query";
import { State } from "../state";

type PaginationState<T extends Data> = {
	loading: boolean;
	done: boolean;
	results: Results<T>;
	entries: ImmutableEntries<T>;
	backward: EmptyDispatcher;
	forward: EmptyDispatcher;
};

/**
 * State that wraps a `Collection` to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<T extends Data> extends State<PaginationState<T>> {
	/** Collection this pagination is based on. */
	readonly collection: Collection<T>;

	/** Limit of the collection's query. */
	readonly limit: number;

	/** Sorts of the collection's query. */
	readonly sorts: Sorts<T>;

	constructor(collection: Collection<T>, initial?: Results<T>) {
		const { slice, sorts } = collection.query;
		assert(slice.limit, slice.limit); // Collection must have a limit to paginate (otherwise you'd just get the result normally).
		assertLength(sorts, 1, Infinity); // Collection must have at least one sort order to paginate.

		const results = initial || {};
		const entries = Object.entries(results);
		super({
			loading: initial ? false : true,
			done: initial ? entries.length < slice.limit : false,
			results,
			entries,
			backward: () => this.backward(),
			forward: () => this.forward(),
		});
		this.collection = collection;
		this.limit = slice.limit;
		this.sorts = sorts;

		// Automatically load more results if there were no initial results.
		if (!initial) void this._more(); // Call `_more()` directly to skip loading check.
	}

	/** Load more results before the start. */
	backward(): void {
		const { loading, done } = this.value;
		if (!loading && !done) void this._more("before");
	}

	/** Load more results after the end. */
	forward(): void {
		const { loading, done } = this.value;
		if (!loading && !done) void this._more("after");
	}

	private async _more(offset: "after" | "before" = "after"): Promise<void> {
		this.update({ loading: true });
		const lastEntry = offset === "after" ? getLastItem(this.value.entries) : getFirstItem(this.value.entries);
		const offsetCollection = lastEntry ? this.collection[offset](...lastEntry) : this.collection;
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
		const { results: existingResults } = this.value;

		if (!moreCount) {
			this.update({
				done: true,
			});
		} else {
			const results = { ...existingResults, ...moreResults };
			const entries = Object.entries(results);
			this.sorts.apply(entries);
			this.update({
				results,
				entries,
				done: moreCount < this.limit,
			});
		}
	}
}

/** Create a new `Pagination` instance. */
export const createPagination = <T extends Data>(collection: Collection<T>, initial?: Results<T>): Pagination<T> => new Pagination<T>(collection, initial);
