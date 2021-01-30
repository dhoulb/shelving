import { Keys, Entry, ReadonlyEntries, ArrayType, ReadonlyArray, filter, FilterFunction, Data } from "shelving/tools";
import type { Filterable } from "./types";
import { Filter } from "./Filter";
import { Rules } from "./Rules";

/** A set of filters. */
export class Filters<T extends Data = Data> extends Rules<T, Filter<T>> implements Filterable<T> {
	// Add filters.
	is<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "is", value)] };
	}
	not<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "not", value)] };
	}
	in<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "in", value)] };
	}
	lt<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "lt", value)] };
	}
	lte<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "lte", value)] };
	}
	gt<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "gt", value)] };
	}
	gte<K extends "id" | Keys<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "gte", value)] };
	}
	contains<K extends Keys<T>>(key: K, value: T[K] extends ReadonlyArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T, K>(key, "contains", value)] };
	}

	// Override to filter by all child `Filter` instances with a single filter function.
	apply(entries: ReadonlyEntries<T>): ReadonlyEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return filter(entries, (this._filterFunction ||= ([id, data]) => this.match(id, data)));
	}
	private _filterFunction?: FilterFunction<Entry<T>>; // Store the created filter function so it's not recreated on every `apply()` call.
}
