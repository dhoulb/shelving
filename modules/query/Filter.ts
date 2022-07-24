import { ArrayType, ImmutableArray, isArray } from "../util/array.js";
import { Data, Key, getProp } from "../util/data.js";
import { isArrayWith, isEqual, isEqualGreater, isEqualLess, isGreater, isInArray, isLess, Matchable, Match, notEqual, notInArray } from "../util/match.js";
import { filterItems } from "../util/filter.js";
import { Rule } from "./Rule.js";

/** Possible operator references. */
export type FilterOperator = "IS" | "NOT" | "IN" | "OUT" | "CONTAINS" | "LT" | "LTE" | "GT" | "GTE";

/** Format that allows filters to be specified as a string, e.g. `!name` means `name is not` and `age>` means `age is more than` and `tags[]` means `tags array contains` */
export type FilterKey<T extends Data> = Key<T> | `${Key<T>}` | `!${Key<T>}` | `${Key<T>}[]` | `${Key<T>}<` | `${Key<T>}<=` | `${Key<T>}>` | `${Key<T>}>=`;

/** Format that allows multiple filters to be specified as a plain object. */
export type FilterProps<T extends Data> = {
	[K in Key<T> as `${K}` | `!${K}`]?: T[K] | ImmutableArray<T[K]>; // IS/NOT/IN/OUT
} & {
	[K in Key<T> as `${K}[]`]?: T[K] extends ImmutableArray ? ArrayType<T[K]> : never; // CONTAINS
} & {
	[K in Key<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: T[K]; // GT/GTE/LT/LTE
};

/** Map `FilterOperator` to its corresponding `Match` function. */
const MATCHERS: { [K in FilterOperator]: Match } = {
	IS: isEqual,
	NOT: notEqual,
	IN: isInArray,
	OUT: notInArray,
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
export class Filter<T extends Data> extends Rule<T> implements Matchable<T, void> {
	/** Parse a set of FilterProps and return the corresponding array of `Filter` instances. */
	static on<X extends Data>(key: FilterKey<X>, value: unknown): Filter<X> {
		return key.startsWith("!")
			? new Filter(key.slice(1), isArray(value) ? "OUT" : "NOT", value)
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
			: new Filter(key, isArray(value) ? "IN" : "IS", value);
	}

	readonly key: Key<T>;
	readonly operator: FilterOperator;
	readonly value: unknown;

	constructor(key: Key<T>, operator: FilterOperator, value: unknown) {
		super();
		this.key = key;
		this.operator = operator;
		this.value = value;
	}

	match(item: T): boolean {
		return MATCHERS[this.operator](getProp(item, this.key), this.value);
	}
	transform(items: Iterable<T>): Iterable<T> {
		return filterItems(items, this);
	}
	override toString(): string {
		return `"${_formatKey(this)}":${JSON.stringify(this.value)}`;
	}
}

/** Convert a `Filter` */
function _formatKey<T extends Data>({ key, operator }: Filter<T>): string {
	switch (operator) {
		case "NOT":
		case "OUT":
			return `!${key}`;
		case "CONTAINS":
			return `${key}[]`;
		case "LT":
			return `${key}<`;
		case "LTE":
			return `${key}<=`;
		case "GT":
			return `${key}>`;
		case "GTE":
			return `${key}>=`;
		default:
			return key;
	}
}
