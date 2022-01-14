import { Data, Entry, Matchable, match, isArrayWith, isEqual, isGreater, isEqualGreater, isLess, isEqualLess, notEqual, yieldFiltered, Entries, notInArray, isInArray, Matcher, Key } from "../util/index.js";
import { Rule } from "./Rule.js";
import { getQueryProp } from "./helpers.js";
import { FilterKey, FilterOperator } from "./types.js";

/** Map `FilterOperator` to its corresponding `Matcher` function. */
const MATCHERS: { [K in FilterOperator]: Matcher<unknown, unknown> } = {
	IS: isEqual,
	NOT: notEqual,
	IN: isInArray as Matcher<unknown, unknown>,
	OUT: notInArray as Matcher<unknown, unknown>,
	CONTAINS: isArrayWith,
	LT: isLess,
	LTE: isEqualLess,
	GT: isGreater,
	GTE: isEqualGreater,
};

/**
 * Filter: filters a list of documents.
 *
 * @param key The name of a property that might exist on documents in the collection.
 * @param operator FilterOperator, e.g. `IS` or `CONTAINS`
 * @param value Value the specified property should be matched against.
 */
export class Filter<T extends Data> extends Rule<T> implements Matchable<Entry<T>, void> {
	/** Parse a set of FilterProps and return the corresponding array of `Filter` instances. */
	static on<X extends Data>(key: FilterKey<X>, value: unknown): Filter<X> {
		return key.startsWith("!")
			? new Filter(key.slice(1), value instanceof Array ? "OUT" : "NOT", value)
			: key.endsWith(">")
			? new Filter(key.slice(0, -1), "GT", value)
			: key.endsWith(">=")
			? new Filter(key.slice(0, -2), "GTE", value)
			: key.endsWith("<")
			? new Filter(key.slice(0, -1), "LT", value)
			: key.endsWith("<=")
			? new Filter(key.slice(0, -2), "LTE", value)
			: key.endsWith("[]")
			? new Filter(key.slice(0, -2), "CONTAINS", value)
			: new Filter(key, value instanceof Array ? "IN" : "IS", value);
	}

	readonly key: "id" | Key<T>;
	readonly operator: FilterOperator;
	readonly value: unknown;

	constructor(key: "id" | Key<T>, operator: FilterOperator, value: unknown) {
		super();
		this.key = key;
		this.operator = operator;
		this.value = value;
	}

	match([id, data]: Entry<T>): boolean {
		return match(getQueryProp(id, data, this.key), MATCHERS[this.operator], this.value);
	}
	transform(entries: Entries<T>): Entries<T> {
		return yieldFiltered(entries, this);
	}
	override toString(): string {
		return `${this.key}:${this.operator}:${JSON.stringify(this.value)}`;
	}
}
