import { Entry, Data, Key, yieldFiltered, Results, ImmutableArray, ArrayType } from "../util/index.js";
import type { Filterable, QueryKey } from "./types.js";
import { ArrayContainsFilter, EqualFilter, Filter, GreaterThanEqualFilter, GreaterThanFilter, InArrayFilter, LessThanEqualFilter, LessThanFilter, NotEqualFilter } from "./Filter.js";
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
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new ArrayContainsFilter<T>(key, value)] };
	}
	lt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new LessThanFilter<T>(key, value)] };
	}
	lte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new LessThanEqualFilter<T>(key, value)] };
	}
	gt<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new GreaterThanFilter<T>(key, value)] };
	}
	gte<K extends QueryKey<T>>(key: K, value: K extends "id" ? string : T[K]): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [...this._rules, new GreaterThanEqualFilter<T>(key, value)] };
	}
	match(entry: Entry<T>): boolean {
		for (const rule of this._rules) if (!rule.match(entry)) return false;
		return true;
	}
	get unfiltered(): this {
		return { __proto__: Object.getPrototypeOf(this), ...this, _rules: [] };
	}

	// Implement `Rule`
	transform(iterable: Results<T>): Results<T> {
		return this._rules.length ? yieldFiltered(iterable, this) : iterable;
	}
}
