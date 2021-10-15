import { Data, ImmutableEntries, ArrayType, ImmutableArray, assertLength, assertProp } from "../util/index.js";
import { Slice } from "./Slice.js";
import { Filters } from "./Filters.js";
import { Sorts } from "./Sorts.js";
import { Rule } from "./Rule.js";
import { getQueryProp } from "./helpers.js";
import type { Queryable } from "./types.js";

// Instances to save resources for the default case (empty query).
const EMPTY_FILTERS = new Filters<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SORTS = new Sorts<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
const EMPTY_SLICE = new Slice<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Query: allows filtering, sorting, and slicing (offset and limit) on a list of document values.
 */
export class Query<T extends Data> extends Rule<T> implements Queryable<T> {
	readonly filters: Filters<T>;
	readonly sorts: Sorts<T>;
	readonly slice: Slice<T>;

	constructor(filters: Filters<T> = EMPTY_FILTERS, sorts: Sorts<T> = EMPTY_SORTS, slice: Slice<T> = EMPTY_SLICE) {
		super();
		this.filters = filters;
		this.sorts = sorts;
		this.slice = slice;
	}

	// Add filters.
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.is(key, value) };
	}
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.not(key, value) };
	}
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.in(key, value) };
	}
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.lt(key, value) };
	}
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.lte(key, value) };
	}
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.gt(key, value) };
	}
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.gte(key, value) };
	}
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.contains(key, value) };
	}

	/**
	 * Get query that begins after a given record.
	 * - Offset are based on the sort orders the collection's query uses.
	 * - Every key used for sorting (e.g. `date, title` must be defined in `data`
	 *
	 * @throws AssertionError if this query currently has no sort orders.
	 * @throws AssertionError if the input `data` did not contain a sorted value.
	 */
	after(id: string, data: T): this {
		const sorts = this.sorts;
		assertLength(sorts, 1);
		let filters = this.filters;
		const lastSort = sorts.last;
		for (const sort of sorts) {
			const { key, direction } = sort;
			const compare = sort === lastSort ? (direction === "ASC" ? "gt" : "lt") : direction === "ASC" ? "gte" : "lte";
			if (key !== "id") assertProp(data, key);
			const value = getQueryProp(id, data, key);
			filters = filters[compare](key, value);
		}
		return { __proto__: Query.prototype, ...this, filters };
	}

	/**
	 * Get query that begins before a given record.
	 * - Offset are based on the sort orders the collection's query uses.
	 * - Every key used for sorting (e.g. `date, title` must be defined in `data`
	 *
	 * @throws AssertionError if this query currently has no sort orders.
	 * @throws AssertionError if the input `data` did not contain a sorted value.
	 */
	before(id: string, data: T): this {
		const sorts = this.sorts;
		assertLength(sorts, 1);
		let filters = this.filters;
		const lastSort = sorts.last;
		for (const sort of sorts) {
			const { key, direction } = sort;
			const compare = sort === lastSort ? (direction === "ASC" ? "lt" : "gt") : direction === "ASC" ? "lte" : "gte";
			if (key !== "id") assertProp(data, key);
			const value = getQueryProp(id, data, key);
			filters = filters[compare](key, value);
		}
		return { __proto__: Query.prototype, ...this, filters };
	}

	/**
	 * Sort results by a field in ascending order.
	 * @param `key` Either `id`, or the name of a prop in the document containing scalars.
	 * @returns New instance with new query rules.
	 */
	asc(key: "id" | (keyof T & string)): this {
		return { __proto__: Query.prototype, ...this, sorts: this.sorts.asc(key) };
	}

	/**
	 * Sort results by a field in descending order.
	 * @param `key` Either `id`, or the name of a prop in the document containing scalars.
	 * @returns New instance with new query rules.
	 */
	desc(key: "id" | (keyof T & string)): this {
		return { __proto__: Query.prototype, ...this, sorts: this.sorts.desc(key) };
	}

	/**
	 * Limit result to the first X documents.
	 * @param limit How many documents to limit the result to.
	 * @returns New instance with new query rules.
	 */
	limit(limit: number | null): this {
		if (limit === this.slice.limit) return this;
		return { __proto__: Query.prototype, ...this, slice: new Slice(limit) };
	}

	/**
	 * Filter and limit the number of results and return the count.
	 * - Slightly more efficient than `.apply().length` because counting doesn't require the results to be sorted.
	 * - Don't count if you're then going to use the result, because you'll be filtering twice.
	 */
	count(entries: ImmutableEntries<T>): number {
		if (!entries.length) return 0;
		return this.slice.apply(this.filters.apply(entries)).length;
	}

	// Override `apply()` to apply filters, sorts, and limit (in that order).
	override apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		return this.slice.apply(this.sorts.apply(this.filters.apply(entries)));
	}

	// Implement toString()
	override toString(): string {
		return `${this.filters},${this.sorts},${this.slice}`;
	}
}
