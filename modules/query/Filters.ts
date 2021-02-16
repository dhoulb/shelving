import type { Entry, ImmutableEntries } from "../entry";
import type { ArrayType, ImmutableArray } from "../array";
import { filter, Filterer } from "../filter";
import type { Data } from "../data";
import type { Filterable } from "./types";
import { Filter } from "./Filter";
import { Rules } from "./Rules";

/** A set of filters. */
export class Filters<T extends Data> extends Rules<T, Filter<T>> implements Filterable<T> {
	// Add filters.
	is<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "is", value)] };
	}
	not<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "not", value)] };
	}
	in<K extends "id" | keyof T>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "in", value)] };
	}
	lt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "lt", value)] };
	}
	lte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "lte", value)] };
	}
	gt<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "gt", value)] };
	}
	gte<K extends "id" | keyof T>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "gte", value)] };
	}
	contains<K extends keyof T>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "contains", value)] };
	}

	// Override to filter by all child `Filter` instances with a single filter function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return filter(entries, (this._filterer ||= ([id, data]) => this.match(id, data)));
	}
	private _filterer?: Filterer<Entry<T>>; // Store the created filter function so it's not recreated on every `apply()` call.
}
