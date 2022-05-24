import type { Data, Key } from "../util/data.js";
import type { ArrayType, ImmutableArray } from "../util/array.js";
import type { Entries, Entry } from "../util/entry.js";
import { assert } from "../util/assert.js";
import { limitItems } from "../util/iterate.js";
import { Filterable, Filters } from "./Filters.js";
import { Sortable, Sorts } from "./Sorts.js";
import { Rule } from "./Rule.js";
import { getQueryProp } from "./util.js";
import { Filter, FilterKey, FilterProps } from "./Filter.js";
import { SortKey, SortKeys } from "./Sort.js";

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new Filters<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new Sorts<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/** Interface that combines Filterable, Sortable, Sliceable. */
export interface Queryable<T extends Data> extends Filterable<T>, Sortable<T> {
	/**
	 * Return a new instance of this class with an after offset defined.
	 * - Offset are based on the sort orders the collection's query uses.
	 * - Every key used for sorting (e.g. `date, title` must be defined in `data`
	 *
	 * @throws AssertionError if this query currently has no sort orders.
	 * @throws AssertionError if the input `data` did not contain a sorted value.
	 */
	after(id: string, data: T): this;

	/** Return a new instance of this class with a before offset defined. */
	before(id: string, data: T): this;

	/** Return a new instance of this class with no filters specified. */
	unfilter: this;

	/** Return a new instance of this class with no sorts specified. */
	unsort: this;

	/** The maximum number of items allowed by the limit. */
	readonly limit: number | null;

	/** Return a new instance of this class with a limit set. */
	max(max: number | null): this;
}

/** Allows filtering, sorting, and limiting on a set of results. */
export class Query<T extends Data> extends Rule<T> implements Queryable<T> {
	/** Create a new `Query` object from a set of `QueryProps` */
	static on<X extends Data>(filters?: FilterProps<X>, sorts?: SortKey<X> | ImmutableArray<SortKey<X>>, limit?: number | null): Query<X> {
		return new Query<X>(filters && Filters.on<X>(filters), sorts && Sorts.on<X>(sorts), limit);
	}

	readonly filters: Filters<T>;
	readonly sorts: Sorts<T>;
	readonly limit: number | null;
	constructor(filters: Filters<T> = EMPTY_FILTERS, sorts: Sorts<T> = EMPTY_SORTS, limit: number | null = null) {
		super();
		this.filters = filters;
		this.sorts = sorts;
		this.limit = limit;
	}

	// Implement `Filterable`
	filter(props: FilterProps<T>): this;
	filter(key: "id" | "!id" | "id>" | "id>=" | "id<" | "id<=", value: string): this;
	filter(key: "id" | "!id", value: ImmutableArray<string>): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}` | `${K}>` | `${K}>=` | `${K}<` | `${K}<=`, value: T[K]): this;
	filter<K extends Key<T>>(key: `${K}` | `!${K}`, value: ImmutableArray<T[K]>): this;
	filter<K extends Key<T>>(key: `${K}[]`, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this;
	filter(input: FilterKey<T> | FilterProps<T>, value?: unknown): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.filter(input as "id", value as string) };
	}
	get unfilter(): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: EMPTY_FILTERS };
	}
	match(entry: Entry<T>): boolean {
		return this.filters.match(entry);
	}

	// Implement `Sortable`
	sort(...keys: SortKeys<T>[]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, sorts: this.sorts.sort(...keys) };
	}
	get unsort(): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, sorts: EMPTY_SORTS };
	}
	rank(left: Entry<T>, right: Entry<T>): number {
		return this.sorts.rank(left, right);
	}

	/** Return a new instance of this class with a limit defined. */
	max(limit: number | null): this {
		return limit === this.limit ? this : { __proto__: Object.getPrototypeOf(this), ...this, limit };
	}

	// Implement `Queryable`
	after(id: string, data: T): this {
		const filters = [...this.filters];
		const lastSort = this.sorts.last;
		assert(lastSort);
		for (const sort of this.sorts) {
			const { key, direction } = sort;
			filters.push(new Filter(key, direction === "ASC" ? (sort === lastSort ? "GT" : "GTE") : sort === lastSort ? "LT" : "LTE", getQueryProp(id, data, key)));
		}
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: new Filters(...filters) };
	}
	before(id: string, data: T): this {
		const filters = [...this.filters];
		const lastSort = this.sorts.last;
		assert(lastSort);
		for (const sort of this.sorts) {
			const { key, direction } = sort;
			filters.push(new Filter(key, direction === "ASC" ? (sort === lastSort ? "LT" : "LTE") : sort === lastSort ? "GT" : "GTE", getQueryProp(id, data, key)));
		}
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: new Filters(...filters) };
	}

	// Implement `Rule`
	transform(entries: Entries<T>): Entries<T> {
		const sorted = this.sorts.transform(this.filters.transform(entries));
		return typeof this.limit === "number" ? limitItems(sorted, this.limit) : sorted;
	}

	// Implement toString()
	override toString(): string {
		return `filters=${this.filters}&sorts=${this.sorts}${this.limit ? `&limit=${this.limit}` : ""}`;
	}
}
