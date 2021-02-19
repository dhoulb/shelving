import { assert, assertLength } from "../assert";
import { Data, Results } from "../data";
import { Collection } from "../db";
import { thispatch } from "../function";
import { getLastProp } from "../object";
import { State } from "../state";

type PaginationState<T extends Data> = {
	loading: boolean;
	done: boolean;
	results: Results<T>;
	count: number;
};

/**
 * State that wraps a `Collection` to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<T extends Data> extends State<PaginationState<T>> {
	/** Collection this pagination is based on. */
	private _collection: Collection<T>;

	/** Limit of the collection's query. */
	private _limit: number;

	constructor(collection: Collection<T>, initial?: Results<T>) {
		const { slice, sorts } = collection.query;
		assert(slice.limit, slice.limit); // Collection must have a limit to paginate (otherwise you'd just get the result normally).
		assertLength(sorts, 1, Infinity); // Collection must have at least one sort order to paginate.

		const count = initial ? Object.keys(initial).length : 0;
		const results = initial || {};
		super(initial ? { loading: false, done: count < slice.limit, count, results } : { loading: false, done: false, count, results });
		this._collection = collection;
		this._limit = slice.limit;

		// Automatically load more results if there were no initial results.
		if (!initial) this.more();
	}

	/** Call this function to load more results. */
	more(): void {
		thispatch(this, this._more, undefined);
	}
	private async _more(): Promise<void> {
		try {
			const { loading, done, results, count } = this.value;
			if (loading || done) return;

			this.update({ loading: true });

			const lastEntry = getLastProp(results);
			const offsetCollection = lastEntry ? this._collection.after(...lastEntry) : this._collection;
			const moreResults = await offsetCollection.results;
			const moreCount = Object.keys(results).length;

			this.set({
				loading: false,
				done: moreCount < this._limit,
				results: moreCount ? { ...results, ...moreResults } : results,
				count: count + moreCount,
			});
		} catch (thrown) {
			this.error(thrown);
		}
	}
}

/** Create a new `Pagination` instance. */
export const createPagination = <T extends Data>(collection: Collection<T>, initial?: Results<T>): Pagination<T> => new Pagination<T>(collection, initial);
