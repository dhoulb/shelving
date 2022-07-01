import type { Unsubscribe } from "../observe/Observable.js";
import type { QueryReference } from "../db/Reference.js";
import type { Data, Entities, OptionalEntity } from "../util/data.js";
import { getQueryFirstData, getQueryFirstValue, isSameReference } from "../db/Reference.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { findSourceProvider } from "../provider/ThroughProvider.js";
import { Entity } from "../util/data.js";
import { State } from "../state/State.js";
import { MemoryTable } from "../provider/MemoryProvider.js";
import { MatchObserver } from "../observe/MatchObserver.js";
import { ConditionError } from "../error/ConditionError.js";
import { BooleanState } from "../state/BooleanState.js";
import { dispatch } from "../util/function.js";
import { useReduce } from "./useReduce.js";
import { useSubscribe } from "./useSubscribe.js";

/** Hold the current state of a query. */
export class QueryState<T extends Data> extends State<Entities<T>> {
	readonly ref: QueryReference<T>;
	readonly busy = new BooleanState();
	readonly limit: number;

	protected readonly _table: MemoryTable<T>;

	/** Time this state was last updated with a new value. */
	get time(): number | undefined {
		return this._table.getQueryTime(this.ref);
	}

	/** How old this state's value is (in milliseconds). */
	get age(): number {
		const time = this.time;
		return typeof time === "number" ? Date.now() - time : Infinity;
	}

	/** Can more items be loaded after the current result. */
	get hasMore(): boolean {
		return this._hasMore;
	}
	protected _hasMore = false;

	/** Get the first document matched by this query or `null` if this query has no items. */
	get firstValue(): OptionalEntity<T> {
		return getQueryFirstValue(this.value);
	}

	/** Get the first document matched by this query. */
	get firstData(): Entity<T> {
		return getQueryFirstData(this.value, this.ref);
	}

	/** Get the last document matched by this query or `null` if this query has no items. */
	get lastValue(): OptionalEntity<T> {
		return getQueryFirstValue(this.value);
	}

	/** Get the last document matched by this query. */
	get lastData(): Entity<T> {
		return getQueryFirstData(this.value, this.ref);
	}

	/** Does the document have at least one result. */
	get exists(): boolean {
		return !!this.value.length;
	}

	/** Get the number of items matching this query. */
	get count(): number {
		return this.value.length;
	}

	constructor(ref: QueryReference<T>) {
		super();
		this._table = findSourceProvider(ref.db.provider, CacheProvider).memory.getTable(ref);
		this.ref = ref;
		this.limit = ref.limit ?? Infinity;

		// If the result is cached use it as the initial value.
		const isCached = typeof this._table.getQueryTime(ref) === "number";
		if (isCached) this.next(this._table.getQuery(ref)); // Use the existing cached value.
		else dispatch(this.refresh); // Queue a request to refresh the value.
	}

	/** Refresh this state from the source provider. */
	refresh = async (): Promise<void> => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) {
			try {
				this.busy.next(true);
				const result = await this.ref.value;
				this._hasMore = result.length < this.limit;
				this.busy.next(false);
				this.next(result);
			} catch (thrown) {
				this.error(thrown);
			}
		}
	};

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (!this.busy.value && this.age > maxAge) dispatch(this.refresh);
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Unsubscribe {
		return this.connect(() => this.ref.subscribe({}));
	}

	// Override to subscribe to the cache when an observer is added.
	protected override _addFirstObserver(): void {
		// Connect this state to the source.
		// Connect through a `MatchObserver` that only dispatches `next()` if the query is actually cached (it might just be `[]` because no query has been cached yet).
		this.connect(() => this._table.subscribeQuery(this.ref, new MatchObserver(() => this._table.getQueryTime(this.ref) !== undefined, this)));
	}

	// Override to unsubscribe from the cache when an observer is removed.
	protected override _removeLastObserver(): void {
		// Disconnect all sources.
		this.disconnect();
	}

	/**
	 * Load more items after the last once.
	 * - Promise that needs to be handled.
	 */
	loadMore = async (): Promise<void> => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) {
			try {
				this.busy.next(true);
				const items = await this.ref.after(this.lastData).value;
				this.next([...this.value, ...items]);
				this._hasMore = items.length < this.limit;
				this.busy.next(false);
			} catch (thrown) {
				this.error(thrown);
			}
		}
	};
}

/** Reuse the previous `QueryState` or create a new one. */
const _getQueryState = <T extends Data>(previous: QueryState<T> | undefined, ref: QueryReference<T> | undefined): QueryState<T> | undefined =>
	!ref ? undefined : previous && isSameReference(previous.ref, ref) ? previous : new QueryState(ref);

/**
 * Use a query in a React component.
 * - Use `useQuery(ref).data` to get the data of the query.
 * - Use `useQuery(ref).value` to get the data of the query or `null` if it doesn't exist.
 * - Use `useQuery(ref).exists` to check if the query is loaded before accessing `.data` or `.value`
 */
export function useQuery<T extends Data>(ref: QueryReference<T>): QueryState<T>;
export function useQuery<T extends Data>(ref?: QueryReference<T>): QueryState<T> | undefined;
export function useQuery<T extends Data>(ref?: QueryReference<T>): QueryState<T> | undefined {
	const state = useReduce(_getQueryState, ref);
	useSubscribe(state);
	return state;
}
