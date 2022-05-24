import type { Entry, Entries } from "../util/entry.js";
import type { Data, Key } from "../util/data.js";
import type { ArrayType, ImmutableArray } from "../util/array.js";
import { isArrayWith, isEqual, isEqualGreater, isEqualLess, isGreater, isInArray, isLess, match, Matchable, Matcher, notEqual, notInArray, yieldFiltered } from "../util/filter.js";
import { getQueryProp } from "./util.js";
import { Rule } from "./Rule.js";

/** Possible operator references. */
export type FilterOperator = "IS" | "NOT" | "IN" | "OUT" | "CONTAINS" | "LT" | "LTE" | "GT" | "GTE";

/** Format that allows filters to be specified as a string, e.g. `!name` means `name is not` and `age>` means `age is more than` and `tags[]` means `tags array contains` */
export type FilterKey<T extends Data> = "id" | "!id" | "id>" | "id>=" | "id<" | "id<=" | Key<T> | `${Key<T>}` | `!${Key<T>}` | `${Key<T>}[]` | `${Key<T>}<` | `${Key<T>}<=` | `${Key<T>}>` | `${Key<T>}>=`;

/** Format that allows multiple filters to be specified as a plain object. */
export type FilterProps<T extends Data> = {
	"id"?: string | ImmutableArray<string>;
	"!id"?: string | ImmutableArray<string>;
	"id>"?: string;
	"id>="?: string;
	"id<"?: string;
	"id<="?: string;
} & {
	[K in Key<T> as `${K}` | `!${K}`]?: T[K] | ImmutableArray<T[K]>; // IS/NOT/IN/OUT
} & {
	[K in Key<T> as `${K}[]`]?: T[K] extends ImmutableArray ? ArrayType<T[K]> : never; // CONTAINS
} & {
	[K in Key<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: T[K]; // GT/GTE/LT/LTE
};

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
