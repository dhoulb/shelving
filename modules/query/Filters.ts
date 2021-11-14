import { Entry, ImmutableEntries, ArrayType, ImmutableArray, Data, filter, Matchable } from "../util/index.js";
import type { Filterable } from "./types.js";
import {
	ArrayContainsFilter,
	EqualFilter,
	Filter,
	GreaterThanEqualFilter,
	GreaterThanFilter,
	InArrayFilter,
	LessThanEqualFilter,
	LessThanFilter,
	NotEqualFilter,
} from "./Filter.js";
import { Rules } from "./Rules.js";

/** A set of filters. */
export class Filters<T extends Data> extends Rules<T, Filter<T>> implements Filterable<T>, Matchable<Entry<T>, void> {
	// Add filters.
	is<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new EqualFilter<T>(key, value)] };
	}
	not<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new NotEqualFilter<T>(key, value)] };
	}
	in<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new InArrayFilter<T>(key, value)] };
	}
	contains<K extends keyof T>(key: K & string, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new ArrayContainsFilter<T>(key, value)] };
	}
	lt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new LessThanFilter<T>(key, value)] };
	}
	lte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new LessThanEqualFilter<T>(key, value)] };
	}
	gt<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new GreaterThanFilter<T>(key, value)] };
	}
	gte<K extends "id" | keyof T>(key: K & string, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, rules: [...this.rules, new GreaterThanEqualFilter<T>(key, value)] };
	}

	/** Match an individual document against this rule. */
	match(entry: Entry<T>): boolean {
		// If any rule returns false, return false.
		for (const rule of this.rules) if (!rule.match(entry)) return false;
		return true;
	}

	// Override to filter by all child `Filter` instances with a single filter function.
	override queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		if (!this.rules.length || !entries.length) return entries;
		return filter(entries, this);
	}
}
