import { Data, ArrayType, ImmutableArray, assert, Entry, Key, limitItems, Results } from "../util/index.js";
import type { Queryable, QueryKey } from "./types.js";
import { Filters } from "./Filters.js";
import { Sorts } from "./Sorts.js";
import { Rule } from "./Rule.js";
import { getQueryProp } from "./helpers.js";
import { GreaterThanEqualFilter as GTE, GreaterThanFilter as GT, LessThanEqualFilter as LTE, LessThanFilter as LT } from "./Filter.js";

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new Filters<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new Sorts<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/** Allows filtering, sorting, and limiting on a set of results. */
export class Query<T extends Data> extends Rule<T> implements Queryable<T> {
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
	is<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.is(key, value) };
	}
	not<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.not(key, value) };
	}
	in<K extends QueryKey<T>>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.in(key, value) };
	}
	contains<K extends Key<T>>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.contains(key, value) };
	}
	lt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.lt(key, value) };
	}
	lte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.lte(key, value) };
	}
	gt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.gt(key, value) };
	}
	gte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: this.filters.gte(key, value) };
	}
	match(entry: Entry<T>): boolean {
		return this.filters.match(entry);
	}

	// Implement `Sortable`
	asc(key: QueryKey<T> = "id"): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, sorts: this.sorts.asc(key) };
	}
	desc(key: QueryKey<T> = "id"): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, sorts: this.sorts.desc(key) };
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
			const AppliedFilter = sort.direction === "ASC" ? (sort === lastSort ? GT : GTE) : sort === lastSort ? LT : LTE;
			filters.push(new AppliedFilter(sort.key, getQueryProp(id, data, sort.key)));
		}
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: new Filters(...filters) };
	}
	before(id: string, data: T): this {
		const filters = [...this.filters];
		const lastSort = this.sorts.last;
		assert(lastSort);
		for (const sort of this.sorts) {
			const AppliedFilter = sort.direction === "ASC" ? (sort === lastSort ? LT : LTE) : sort === lastSort ? GT : GTE;
			filters.push(new AppliedFilter(sort.key, getQueryProp(id, data, sort.key)));
		}
		return { __proto__: Object.getPrototypeOf(this), ...this, filters: new Filters(...filters) };
	}

	// Implement `Rule`
	derive(iterable: Results<T>): Results<T> {
		const sorted = this.sorts.derive(this.filters.derive(iterable));
		return typeof this.limit === "number" ? limitItems(sorted, this.limit) : sorted;
	}

	// Implement toString()
	override toString(): string {
		return `${this.filters}&${this.sorts}${this.limit ? `&LIMIT=${this.limit}` : ""}`;
	}
}
