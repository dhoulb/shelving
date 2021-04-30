import { getFirstItem, getLastItem } from "../array";
import { assert, assertLength } from "../assert";
import { Data, Results } from "../data";
import { Documents } from "../db";
import { ImmutableEntries } from "../entry";
import { Sorts } from "../query";
import { bindMethod } from "../class";
import { State } from "../state";

/**
 * State that wraps a `Documents` reference to enable pagination.
 * - If you pass in initial values, it will use that as the first page.
 * - If you don't pass in initial values, it will autoload the first page.
 */
export class Pagination<T extends Data> extends State<ImmutableEntries<T>> {
	/**
	 * Create a new `Pagination` instance.
	 * - Static function so you can use it with `useLazy()` and for consistency with `State`
	 */
	static for<X extends Data>(ref: Documents<X>, initial?: Results<X>): Pagination<X> {
		return new Pagination<X>(ref, initial);
	}

	private _results: Results<T>; // Cached current set of results.

	/** Documents ref this pagination is based on. */
	readonly ref: Documents<T>;

	/** Limit of the collection's query. */
	readonly limit: number;

	/** Sorts of the collection's query. */
	readonly sorts: Sorts<T>;

	// Protected to encourage `Pagination.for()`
	protected constructor(ref: Documents<T>, initial?: Results<T>) {
		const { slice, sorts } = ref.query;
		assert(slice.limit, slice.limit); // Collection must have a limit to paginate (otherwise you'd just get the result normally).
		assertLength(sorts, 1, Infinity); // Collection must have at least one sort order to paginate.

		const results = initial || {};
		const entries = Object.entries(results);
		super(entries);
		this._results = results;
		this.ref = ref;
		this.limit = slice.limit;
		this.sorts = sorts;

		if (!initial) {
			// Automatically load more results if there were no initial results.
			this.next(this.mergeReference(ref));
		} else {
			// Automatically complete the stream if there are fewer entries than the slice limit.
			if (entries.length < slice.limit) void this.complete();
		}
	}

	/** Load more results before the start. */
	@bindMethod
	backward(): void {
		if (!this.pending && !this.closed) {
			const entry = getFirstItem(this.value);
			this.next(this.mergeReference(entry ? this.ref.before(...entry) : this.ref));
		}
	}

	/** Load more results after the end. */
	@bindMethod
	forward(): void {
		if (!this.pending && !this.closed) {
			const entry = getLastItem(this.value);
			this.next(this.mergeReference(entry ? this.ref.after(...entry) : this.ref));
		}
	}

	/**
	 * Merge more results to the pagination.
	 * - If the number of results in `moreResults` is less than `this.limit`, the pagination is considered to be done.
	 * - The results are sorted when they're added, so whether they're prepended or appended doesn't matter.
	 */
	merge(moreResults: Results<T>): void {
		this.next(this.mergeResults(moreResults));
	}

	/** Get the result of merging our current results with some new results loaded from a `Documents` reference. */
	private async mergeReference(ref: Documents<T>): Promise<ImmutableEntries<T>> {
		return this.mergeResults(await ref.results);
	}

	/** Get the result of merging our current results and some new results. */
	private mergeResults(moreResults: Results<T>): ImmutableEntries<T> {
		const moreCount = Object.keys(moreResults).length;
		if (!moreCount) {
			this.complete();
			return this.value;
		} else {
			this._results = { ...this._results, ...moreResults };
			const entries: ImmutableEntries<T> = Object.entries(this._results);
			this.sorts.apply(entries);
			this.set(entries);
			if (moreCount < this.limit) this.complete();
			return entries;
		}
	}
}
