import { Entry, Data, Key, yieldFiltered, Entries, ImmutableArray, ArrayType } from "../util/index.js";
import type { Filterable, QueryKey } from "./types.js";
import { ArrayWithFilter, EqualFilter, Filter, EqualGreaterFilter, GreaterFilter, InArrayFilter, EqualLessFilter, LessFilter, NotEqualFilter } from "./Filter.js";
import { Rules } from "./Rules.js";

/** A set of filters. */
export class Filters<T extends Data> extends Rules<T, Filter<T>> implements Filterable<T> {
	// Implement `Filterable`
	is<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new EqualFilter<T>(key, value)] };
	}
	not<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new NotEqualFilter<T>(key, value)] };
	}
	in<K extends QueryKey<T>>(key: K, value: K extends "id" ? readonly string[] : readonly T[K][]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new InArrayFilter<T>(key, value)] };
	}
	contains<K extends Key<T>>(key: K, value: T[K] extends ImmutableArray ? ArrayType<T[K]> : never): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new ArrayWithFilter<T>(key, value)] };
	}
	lt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new LessFilter<T>(key, value)] };
	}
	lte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new EqualLessFilter<T>(key, value)] };
	}
	gt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new GreaterFilter<T>(key, value)] };
	}
	gte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new EqualGreaterFilter<T>(key, value)] };
	}
	match(entry: Entry<T>): boolean {
		for (const rule of this._rules) if (!rule.match(entry)) return false;
		return true;
	}
	get unfiltered(): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [] };
	}

	// Implement `Rule`
	transform(iterable: Entries<T>): Entries<T> {
		return this._rules.length ? yieldFiltered(iterable, this) : iterable;
	}
}
