import { Data, DataKey, FlatDataKey, getDataProps } from "../util/data.js";
import type { Nullish } from "../util/null.js";
import { ImmutableArray, isArray } from "../util/array.js";
import type { Matchable, Match } from "../util/match.js";
import { isArrayWith, isEqualGreater, isEqualLess, isGreater, isInArray, isLess, notInArray, isEqual, notEqual } from "../util/equal.js";
import { filterItems, isIterable } from "../util/iterate.js";
import { getProp } from "../util/object.js";
import { splitString } from "../util/string.js";
import type { Constraint } from "./Constraint.js";

/** Possible operator references. */
export type FilterOperator =
	| "IS" //
	| "NOT"
	| "IN"
	| "OUT"
	| "CONTAINS"
	| "LT"
	| "LTE"
	| "GT"
	| "GTE";

/** Format that allows filters to be specified as a string, e.g. `!name` means `name is not` and `age>` means `age is more than` and `tags[]` means `tags array contains` */
export type FilterKey<T extends Data> = DataKey<FilterProps<T>>;

/** Format that allows multiple filters to be specified as a plain object. */
export type FilterProps<T extends Data> = {
	[K in FlatDataKey<T> as `${K}` | `!${K}`]?: T[K] | ImmutableArray<T[K]>; // IS/NOT/IN/OUT
} & {
	[K in FlatDataKey<T> as `${K}<` | `${K}<=` | `${K}>` | `${K}>=`]?: T[K]; // GT/GTE/LT/LTE
} & {
	[K in FlatDataKey<T> as `${K}[]`]?: Required<T>[K] extends ImmutableArray<infer X> ? X : never; // CONTAINS
};

/** List of filters in a flexible format. */
export type FilterList<T extends Data> = FilterProps<T> | FilterConstraint<T> | Iterable<Nullish<FilterProps<T> | FilterConstraint<T>>>;

/** Map `FilterOperator` to its corresponding `Match` function. */
const MATCHERS: { [K in FilterOperator]: Match } = {
	IS: isEqual,
	NOT: notEqual,
	IN: isInArray as Match,
	OUT: notInArray as Match,
	CONTAINS: isArrayWith as Match,
	LT: isLess,
	LTE: isEqualLess,
	GT: isGreater,
	GTE: isEqualGreater,
};

/**
 * Filter: filters a list of data.
 *
 * @param key The name of a property that might exist on data in the collection.
 * @param operator FilterOperator, e.g. `IS` or `CONTAINS`
 * @param value Value the specified property should be matched against.
 */
export class FilterConstraint<T extends Data = Data> implements Constraint<T>, Matchable<[T]> {
	readonly keys: readonly [string, ...string[]];
	readonly operator: FilterOperator;
	readonly value: unknown;
	get key(): string {
		return this.keys.join(".");
	}
	get filterKey(): string {
		const { operator, key } = this;
		return operator === "IS" || operator === "IN"
			? key
			: operator === "NOT" || operator === "OUT"
			? `!${key}`
			: operator === "CONTAINS"
			? `${key}[]`
			: operator === "LT"
			? `${key}<`
			: operator === "LTE"
			? `${key}<=`
			: operator === "GT"
			? `${key}>`
			: operator === "GTE"
			? `${key}>=`
			: operator; // Never.
	}
	constructor(filterKey: FilterKey<T>, value: unknown);
	constructor(filterKey: string, value: unknown) {
		if (filterKey.startsWith("!")) {
			this.keys = splitString(filterKey.slice(1), ".");
			this.operator = isArray(value) ? "OUT" : "NOT";
		} else if (filterKey.endsWith("[]")) {
			this.keys = splitString(filterKey.slice(0, -2), ".");
			this.operator = "CONTAINS";
		} else if (filterKey.endsWith(">")) {
			this.keys = splitString(filterKey.slice(0, -1), ".");
			this.operator = "GT";
		} else if (filterKey.endsWith(">=")) {
			this.keys = splitString(filterKey.slice(0, -2), ".");
			this.operator = "GTE";
		} else if (filterKey.endsWith("<")) {
			this.keys = splitString(filterKey.slice(0, -1), ".");
			this.operator = "LT";
		} else if (filterKey.endsWith("<=")) {
			this.keys = splitString(filterKey.slice(0, -2), ".");
			this.operator = "LTE";
		} else {
			this.keys = splitString(filterKey, ".");
			this.operator = isArray(value) ? "IN" : "IS";
		}
		this.value = value;
	}
	match(item: T): boolean {
		return MATCHERS[this.operator](getProp(item, ...this.keys), this.value);
	}
	transform(items: Iterable<T>): Iterable<T> {
		return filterItems(items, this);
	}
	toString(): string {
		return `"${this.filterKey}":${JSON.stringify(this.value)}`;
	}
}

/** Turn `FilterList` into a list of `FilterConstraint` instances. */
export function* getFilters<T extends Data>(list: FilterList<T> | FilterList<T>[]): Iterable<FilterConstraint<T>> {
	if (list instanceof FilterConstraint) {
		yield list;
	} else if (isIterable(list)) {
		for (const filter of list) if (filter) yield* getFilters(filter);
	} else {
		for (const [key, value] of getDataProps(list)) yield new FilterConstraint<T>(key, value);
	}
}
