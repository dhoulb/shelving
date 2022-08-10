import { ArrayType, ImmutableArray, isArray } from "../util/array.js";
import { Data, Key } from "../util/data.js";
import { isArrayWith, isEqual, isEqualGreater, isEqualLess, isGreater, isInArray, isLess, Matchable, Match, notEqual, notInArray } from "../util/match.js";
import { filterItems } from "../util/filter.js";
import { isIterable } from "../util/iterate.js";
import { NotString } from "../util/string.js";
import { Constraint } from "./Constraint.js";

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

/** List of filters in a flexible format. */
export type FilterList<T extends Data> = FilterProps<T> | FilterConstraint<T> | Iterable<FilterList<T> & NotString>;

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
 * Filter: filters a list of data.
 *
 * @param key The name of a property that might exist on data in the collection.
 * @param operator FilterOperator, e.g. `IS` or `CONTAINS`
 * @param value Value the specified property should be matched against.
 */
export class FilterConstraint<T extends Data> implements Constraint<T>, Matchable<T, void> {
	readonly key: string;
	readonly operator: FilterOperator;
	readonly value: unknown;
	get filterKey(): string {
		const { operator, key } = this;
		if (operator === "NOT" || operator === "OUT") return `!${key}`;
		else if (operator === "CONTAINS") return `${key}[]`;
		else if (operator === "LT") return `${key}<`;
		else if (operator === "LTE") return `${key}<=`;
		else if (operator === "GT") return `${key}>`;
		else if (operator === "GTE") return `${key}>=`;
		else return key;
	}
	constructor(filterKey: FilterKey<T>, value: unknown) {
		if (filterKey.startsWith("!")) {
			this.key = filterKey.slice(1);
			this.operator = isArray(value) ? "OUT" : "NOT";
		} else if (filterKey.endsWith(">")) {
			this.key = filterKey.slice(0, -1);
			this.operator = "GT";
		} else if (filterKey.endsWith(">=")) {
			this.key = filterKey.slice(0, -2);
			this.operator = "GTE";
		} else if (filterKey.endsWith("<")) {
			this.key = filterKey.slice(0, -1);
			this.operator = "LT";
		} else if (filterKey.endsWith("<=")) {
			this.key = filterKey.slice(0, -2);
			this.operator = "LTE";
		} else if (filterKey.endsWith("[]")) {
			this.key = filterKey.slice(0, -2);
			this.operator = "CONTAINS";
		} else {
			this.key = filterKey;
			this.operator = isArray(value) ? "IN" : "IS";
		}
		this.value = value;
	}
	match(item: T): boolean {
		return MATCHERS[this.operator](item[this.key], this.value);
	}
	transform(items: Iterable<T>): Iterable<T> {
		return filterItems(items, this);
	}
	toString(): string {
		return `"${this.filterKey}":${JSON.stringify(this.value)}`;
	}
}

/** Get the separate filters generated from a list of filters. */
export function* getFilters<T extends Data>(filters: FilterList<T>): Iterable<FilterConstraint<T>> {
	if (filters instanceof FilterConstraint) {
		yield filters;
	} else if (isIterable(filters)) {
		for (const filter of filters) yield* getFilters(filter);
	} else {
		for (const [key, value] of Object.entries(filters)) yield new FilterConstraint<T>(key, value);
	}
}
