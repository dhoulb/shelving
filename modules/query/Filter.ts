import { Data, Entry, Matchable, match, isArrayWith, isEqual, isGreater, isEqualGreater, isInArray, isLess, isEqualLess, isNotEqual, yieldFiltered, Entries, ImmutableArray } from "../util/index.js";
import { Rule } from "./Rule.js";
import { getQueryProp } from "./helpers.js";
import { FilterOperator, QueryKey } from "./types.js";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type MatchType reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export abstract class Filter<T extends Data, V extends unknown = unknown> extends Rule<T> implements Matchable<Entry<T>, void> {
	abstract readonly operator: FilterOperator;
	readonly key: QueryKey<T>;
	readonly value: V;
	constructor(key: QueryKey<T>, value: V) {
		super();
		this.key = key;
		this.value = value;
	}
	abstract match([id, data]: Entry<T>, target: void): boolean;
	transform(entries: Entries<T>): Entries<T> {
		return yieldFiltered(entries, this);
	}
	override toString(): string {
		return `${this.key}:${this.operator}=${JSON.stringify(this.value)}`;
	}
}

/** Filter a set of values with an `IS` clause. */
export class EqualFilter<T extends Data> extends Filter<T> {
	readonly operator = "IS";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isEqual, this.value);
	}
}

/** Filter a set of values with an `NOT` clause. */
export class NotEqualFilter<T extends Data> extends Filter<T> {
	readonly operator = "NOT";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isNotEqual, this.value);
	}
}

/** Filter a set of values with an `IS` clause. */
export class InArrayFilter<T extends Data> extends Filter<T, ImmutableArray> {
	readonly operator = "IN";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isInArray, this.value);
	}
}

/** Filter a set of values with a `CONTAINS` clause. */
export class ArrayWithFilter<T extends Data> extends Filter<T> {
	readonly operator = "CONTAINS";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isArrayWith, this.value);
	}
}

/** Filter a set of values with an `LT` clause. */
export class LessFilter<T extends Data> extends Filter<T> {
	readonly operator = "LT";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isLess, this.value);
	}
}

/** Filter a set of values with an `LTE` clause. */
export class EqualLessFilter<T extends Data> extends Filter<T> {
	readonly operator = "LTE";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isEqualLess, this.value);
	}
}

/** Filter a set of values with an `GT` clause. */
export class GreaterFilter<T extends Data> extends Filter<T> {
	readonly operator = "GT";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isGreater, this.value);
	}
}

/** Filter a set of values with an `GTE` clause. */
export class EqualGreaterFilter<T extends Data> extends Filter<T> {
	readonly operator = "GTE";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isEqualGreater, this.value);
	}
}
