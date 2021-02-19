import { assert, assertLength } from "../assert";
import { SKIP } from "../constants";
import { Data, Results } from "../data";
import { Collection } from "../db";
import { EmptyDispatcher } from "../function";
import { getLastProp } from "../object";
import { State } from "../state";

type PaginationState<T extends Data> = {
	loading: boolean;
	done: boolean;
	results: Results<T>;
	count: number;
	more: EmptyDispatcher;
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
		const done = count < slice.limit;
		super({ loading: false, done, count, results, more: () => this.more() });
		this._collection = collection;
		this._limit = slice.limit;

		// Automatically load more results if there were no initial results.
		if (!initial) this.more();
	}

	/** Call this function to load more results. */
	more(): void {
		this.next(this._more());
	}
	private async _more(): Promise<typeof SKIP | PaginationState<T>> {
		const { loading, done, results, count, more } = this.value;
		if (loading || done) return SKIP;

		this.update({ loading: true });

		const lastEntry = getLastProp(results);
		const offsetCollection = lastEntry ? this._collection.after(...lastEntry) : this._collection;
		const moreResults = await offsetCollection.results;
		const moreCount = Object.keys(results).length;

		return {
			loading: false,
			done: moreCount < this._limit,
			results: moreCount ? { ...results, ...moreResults } : results,
			count: count + moreCount,
			more,
		};
	}
}

/** Create a new `Pagination` instance. */
export const createPagination = <T extends Data>(collection: Collection<T>, initial?: Results<T>): Pagination<T> => new Pagination<T>(collection, initial);
