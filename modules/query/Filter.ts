import { Data, Entry, Matchable, match, CONTAINS, IS, GT, GTE, IN, LT, LTE, NOT, Matcher, filterItems, Results } from "../util/index.js";
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface Filter<T extends Data> {
	readonly operator: FilterOperator;
	readonly matcher: Matcher<unknown, unknown>;
}
export abstract class Filter<T extends Data> extends Rule<T> implements Matchable<Entry<T>, void> {
	readonly key: QueryKey<T>;
	readonly value: unknown;
	constructor(key: QueryKey<T>, value: unknown) {
		super();
		this.key = key;
		this.value = value;
	}
	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), this.matcher, this.value);
	}
	transform(results: Results<T>): Results<T> {
		return filterItems(results, this);
	}
	override toString(): string {
		return `${this.key}:${this.operator}=${JSON.stringify(this.value)}`;
	}
}

/** Filter a set of values with an `IS` clause. */
export class EqualFilter<T extends Data> extends Filter<T> {}
Object.assign(EqualFilter.prototype, { direction: "IS", matcher: IS });

/** Filter a set of values with an `NOT` clause. */
export class NotEqualFilter<T extends Data> extends Filter<T> {}
Object.assign(NotEqualFilter.prototype, { direction: "NOT", matcher: NOT });

/** Filter a set of values with an `IS` clause. */
export class InArrayFilter<T extends Data> extends Filter<T> {}
Object.assign(InArrayFilter.prototype, { direction: "IN", matcher: IN });

/** Filter a set of values with an `CONTAINS` clause. */
export class ArrayContainsFilter<T extends Data> extends Filter<T> {}
Object.assign(ArrayContainsFilter.prototype, { direction: "CONTAINS", matcher: CONTAINS });

/** Filter a set of values with an `LT` clause. */
export class LessThanFilter<T extends Data> extends Filter<T> {}
Object.assign(LessThanFilter.prototype, { direction: "LT", matcher: LT });

/** Filter a set of values with an `LTE` clause. */
export class LessThanEqualFilter<T extends Data> extends Filter<T> {}
Object.assign(LessThanEqualFilter.prototype, { direction: "LTE", matcher: LTE });

/** Filter a set of values with an `GT` clause. */
export class GreaterThanFilter<T extends Data> extends Filter<T> {}
Object.assign(GreaterThanFilter.prototype, { direction: "GT", matcher: GT });

/** Filter a set of values with an `GTE` clause. */
export class GreaterThanEqualFilter<T extends Data> extends Filter<T> {}
Object.assign(GreaterThanEqualFilter.prototype, { direction: "GTE", matcher: GTE });
