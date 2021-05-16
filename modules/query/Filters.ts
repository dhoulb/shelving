import { filter } from "../filter";
import { bindMethod } from "../class";
import { Filter } from "./Filter";
import { Rules } from "./Rules";
import type { Entry, ImmutableEntries } from "../entry";
import type { ArrayType, ImmutableArray } from "../array";
import type { Data } from "../data";
import type { Filterable } from "./types";

/** A set of filters. */
export class Filters<T extends Data> extends Rules<T, Filter<T>> implements Filterable<T> {
	// Add filters.
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "IS", value)] };
	}
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "NOT", value)] };
	}
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "IN", value)] };
	}
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "LT", value)] };
	}
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "LTE", value)] };
	}
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "GT", value)] };
	}
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "GTE", value)] };
	}
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Filters.prototype, ...this, rules: [...this.rules, new Filter<T>(key, "CONTAINS", value)] };
	}

	/**
	 * Match an individual document against this rule.
	 */
	match(id: string, data: T): boolean {
		// If any rule returns false, return false.
		for (const rule of this.rules) if (!rule.match(id, data)) return false;
		return true;
	}

	/**
	 * Return a `Matcher` function that can filter an array of entries
	 */
	@bindMethod // Bind this so we can use it directly in `filter()`
	matcher([id, data]: Entry<T>): boolean {
		return this.match(id, data);
	}

	// Override to filter by all child `Filter` instances with a single filter function.
	apply(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return filter(entries, this.matcher);
	}
}
