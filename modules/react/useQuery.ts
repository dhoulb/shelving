import type { Unsubscribe } from "../observe/Observable.js";
import type { QueryReference } from "../db/Reference.js";
import type { Data, Entities, OptionalEntity, Entity } from "../util/data.js";
import { reduceMapItem } from "../util/map.js";
import { getQueryFirstData, getQueryFirstValue } from "../db/Reference.js";
import { CacheProvider } from "../provider/CacheProvider.js";
import { getOptionalSourceProvider } from "../provider/ThroughProvider.js";
import { State } from "../state/State.js";
import { ConditionError } from "../error/ConditionError.js";
import { BooleanState } from "../state/BooleanState.js";
import { NOVALUE } from "../util/constants.js";
import { useSubscribe } from "./useSubscribe.js";
import { useCache } from "./useCache.js";

/** Hold the current state of a query. */
export class QueryState<T extends Data> extends State<Entities<T>> {
	readonly ref: QueryReference<T>;
	readonly busy = new BooleanState();
	readonly limit: number;

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
		const table = getOptionalSourceProvider(ref.db.provider, CacheProvider)?.memory.getTable(ref);
		const time = table ? table.getQueryTime(ref) : null;
		const isCached = typeof time === "number";
		super(table && isCached ? table.getQuery(ref) : NOVALUE);
		this._time = time;
		this.ref = ref;
		this.limit = ref.limit ?? Infinity;

		// Queue a request to refresh the value if it doesn't exist.
		if (this.loading) this.refresh();
	}

	/** Refresh this state from the source provider. */
	readonly refresh = (): void => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) void this._refresh();
	};
	async _refresh(): Promise<void> {
		this.busy.next(true);
		try {
			const result = await this.ref.value;
			this._hasMore = result.length < this.limit;
			this.next(result);
		} catch (thrown) {
			this.error(thrown);
		} finally {
			this.busy.next(false);
		}
	}

	/** Refresh this state if data in the cache is older than `maxAge` (in milliseconds). */
	refreshStale(maxAge: number) {
		if (this.age > maxAge) this.refresh();
	}

	/** Subscribe this state to the source provider. */
	connectSource(): Unsubscribe {
		return this.connect(() => this.ref.subscribe({}));
	}

	/** Subscribe this state to any `CacheProvider` that exists in the provider chain. */
	connectCache(): Unsubscribe | void {
		const table = getOptionalSourceProvider(this.ref.db.provider, CacheProvider)?.memory.getTable(this.ref);
		return table && this.connect(() => table.subscribeCachedQuery(this.ref, this));
	}

	// Override to subscribe to the cache when an observer is added.
	protected override _addFirstObserver(): void {
		this.connectCache();
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
	readonly loadMore = (): void => {
		if (this.closed) throw new ConditionError("State is closed");
		if (!this.busy.value) void this._loadMore();
	};
	async _loadMore(): Promise<void> {
		this.busy.next(true);
		try {
			const items = await this.ref.after(this.lastData).value;
			this.next([...this.value, ...items]);
			this._hasMore = items.length < this.limit;
		} catch (thrown) {
			this.error(thrown);
		} finally {
			this.busy.next(false);
		}
	}
}

/** Reuse the previous `QueryState` or create a new one. */
const _reduceQueryState = <T extends Data>(existing: QueryState<T> | undefined, ref: QueryReference<T>): QueryState<T> => existing || new QueryState(ref);

/**
 * Use a query in a React component.
 * - Uses the default cache, so will error if not used inside `<Cache>`
 */
export function useQuery<T extends Data>(ref: QueryReference<T>): QueryState<T>;
export function useQuery<T extends Data>(ref?: QueryReference<T>): QueryState<T> | undefined;
export function useQuery<T extends Data>(ref?: QueryReference<T>): QueryState<T> | undefined {
	const cache = useCache();
	const state = ref ? reduceMapItem(cache, ref.toString(), _reduceQueryState, ref) : undefined;
	useSubscribe(state);
	return state;
}
