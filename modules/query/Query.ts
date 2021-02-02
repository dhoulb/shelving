import type { Data, Results } from "../data";
import type { ImmutableEntries } from "../entry";
import type { ArrayType, ImmutableArray } from "../array";
import { Slice } from "./Slice";
import { Filters } from "./Filters";
import { Sorts } from "./Sorts";
import { Rule } from "./Rule";
import type { Queryable } from "./types";

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
	is<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.is(key, value) };
	}
	not<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.not(key, value) };
	}
	in<K extends "id" | keyof T>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.in(key, value) };
	}
	lt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.lt(key, value) };
	}
	lte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.lte(key, value) };
	}
	gt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.gt(key, value) };
	}
	gte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.gte(key, value) };
	}
	contains<K extends keyof T>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Query.prototype, ...this, filters: this.filters.contains(key, value) };
	}

	/**
	 * Sort results by a field in ascending order.
	 * @param `key` Either `id`, or the name of a prop in the document containing scalars.
	 * @returns New instance with new query rules.
	 */
	asc(key: "id" | keyof T): this {
		return { __proto__: Query.prototype, ...this, sorts: this.sorts.asc(key) };
	}

	/**
	 * Sort results by a field in descending order.
	 * @param `key` Either `id`, or the name of a prop in the document containing scalars.
	 * @returns New instance with new query rules.
	 */
	desc(key: "id" | keyof T): this {
		return { __proto__: Query.prototype, ...this, sorts: this.sorts.desc(key) };
	}

	/**
	 * Limit result to the first X documents.
	 * @param limit How many documents to limit the result to.
	 * @returns New instance with new query rules.
	 */
	limit(limit: number | null): this {
		return { __proto__: Query.prototype, ...this, slice: new Slice(limit) };
	}

	/**
	 * Filter and limit the number of results and return the count.
	 * - Slightly more efficient than `.apply().length` because counting doesn't require the results to be sorted.
	 * - Don't count if you're then going to use the result, because you'll be filtering twice.
	 */
	count(input: Results<T>): number {
		const entries = Object.entries(input);
		if (!entries.length) return 0;
		return this.slice.apply(this.filters.apply(entries)).length;
	}

	// Override `match()` to defer straight to `Filters` (neither `Sorts` or `Slice` use match).
	match(id: string, data: T): boolean {
		return this.filters.match(id, data);
	}

	// Override `apply()` to apply filters, sorts, and limit (in that order).
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		return this.slice.apply(this.sorts.apply(this.filters.apply(entries)));
	}

	// Implement toString()
	toString(): string {
		return `${this.filters},${this.sorts},${this.slice}`;
	}
}

/** Create a new Query instance. */
export const createQuery = <T extends Data>(): Query<T> => new Query<T>();
