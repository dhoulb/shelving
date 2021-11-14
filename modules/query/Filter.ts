import {
	Data,
	Entry,
	ImmutableEntries,
	filter,
	Matchable,
	match,
	contains,
	is,
	isGreaterThan,
	isGreaterThanOrEqual,
	isIn,
	isLessThan,
	isLessThanOrEqual,
	isNot,
} from "../util/index.js";
import { Rule } from "./Rule.js";
import { getQueryProp } from "./helpers.js";
import { FilterOperator } from "./types.js";

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param type MatchType reference, e.g. `is` or `contains`
 * @param value Value the specified property should be matched against.
 */
export abstract class Filter<T extends Data> extends Rule<T> implements Matchable<Entry<T>, void> {
	readonly key: "id" | string;
	abstract readonly operator: FilterOperator;
	readonly value: unknown;

	constructor(key: "id" | string, value: unknown) {
		super();
		this.key = key;
		this.value = value;
	}

	// Implement `Matchable`
	abstract match([id, data]: Entry<T>): boolean;

	// Override to apply the filter.
	override queryEntries(entries: ImmutableEntries<T>): ImmutableEntries<T> {
		return filter(entries, this);
	}

	// Implement toString()
	override toString(): string {
		return `${this.key}:${this.operator}=${JSON.stringify(this.value)}`;
	}
}

/** Filter a set of values with an `IS` clause. */
export class EqualFilter<T extends Data> extends Filter<T> {
	readonly operator = "IS";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), is, this.value);
	}
}

/** Filter a set of values with an `NOT` clause. */
export class NotEqualFilter<T extends Data> extends Filter<T> {
	readonly operator = "NOT";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isNot, this.value);
	}
}

/** Filter a set of values with an `IS` clause. */
export class InArrayFilter<T extends Data> extends Filter<T> {
	readonly operator = "IN";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isIn, this.value);
	}
}

/** Filter a set of values with an `CONTAINS` clause. */
export class ArrayContainsFilter<T extends Data> extends Filter<T> {
	readonly operator = "CONTAINS";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), contains, this.value);
	}
}

/** Filter a set of values with an `LT` clause. */
export class LessThanFilter<T extends Data> extends Filter<T> {
	readonly operator = "LT";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isLessThan, this.value);
	}
}

/** Filter a set of values with an `LTE` clause. */
export class LessThanEqualFilter<T extends Data> extends Filter<T> {
	readonly operator = "LTE";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isLessThanOrEqual, this.value);
	}
}

/** Filter a set of values with an `GT` clause. */
export class GreaterThanFilter<T extends Data> extends Filter<T> {
	readonly operator = "GT";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isGreaterThan, this.value);
	}
}

/** Filter a set of values with an `GTE` clause. */
export class GreaterThanEqualFilter<T extends Data> extends Filter<T> {
	readonly operator = "GTE";
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), isGreaterThanOrEqual, this.value);
	}
}
