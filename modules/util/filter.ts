import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import { Entry } from "./entry.js";
import { ImmutableObject } from "./object.js";
import { rankAscending } from "./sort.js";
import { transform, Transformer } from "./transform.js";

/** Object that can match an item against a target with its `match()` function. */
export interface Matchable<L, R> {
	match(item: L, target: R): boolean;
}

/** Object that can match an item against a target with its `match()` function, or a function that can do the same. */
export type Matcher<L, R> = Matchable<L, R> | ((item: L, target: R) => boolean);

/** Match two values using a `Matcher`. */
export function match<L>(item: L, matcher: Matcher<L, void>): boolean;
export function match<L, R>(item: L, matcher: Matcher<L, R>, target: R): boolean;
export function match<L, R>(item: L, matcher: Matcher<L, R | undefined>, target?: R): boolean {
	return typeof matcher === "function" ? matcher(item, target) : matcher.match(item, target);
}

// Regular matchers.
export const isEqual = <T>(item: T | unknown, target: T): item is T => item === target;
export const isNotEqual = <T, N>(item: T | N, target: T): item is N => item !== target;
export const isInArray = <T>(item: T | unknown, targets: ImmutableArray<T>): item is T => targets.includes(item as T);
export const isArrayWith = (items: unknown, target: unknown) => items instanceof Array && items.includes(target);
export const isLess = (item: unknown, target: unknown) => rankAscending(item, target) < 0;
export const isEqualLess = (item: unknown, target: unknown) => rankAscending(item, target) <= 0;
export const isGreater = (item: unknown, target: unknown) => rankAscending(item, target) > 0;
export const isEqualGreater = (item: unknown, target: unknown) => rankAscending(item, target) >= 0;

// Entry key matchers.
export const isKeyEqual = ([key]: Entry, target: string) => isEqual(key, target);
export const isKeyNotEqual = ([key]: Entry, targets: ImmutableArray<string>) => isNotEqual(key, targets);
export const isKeyInArray = ([key]: Entry, targets: ImmutableArray<string>) => isInArray(key, targets);
export const isKeyLess = ([key]: Entry, target: unknown) => isLess(key, target);
export const isKeyEqualLess = ([key]: Entry, target: unknown) => isEqualLess(key, target);
export const isKeyGreater = ([key]: Entry, target: unknown) => isGreater(key, target);
export const isKeyEqualGreater = ([key]: Entry, target: unknown) => isEqualGreater(key, target);

// Entry value matchers.
export const isValueEqual = ([, value]: Entry, target: unknown) => isEqual(value, target);
export const isValueNotEqual = ([, value]: Entry, target: unknown) => isNotEqual(value, target);
export const isValueInArray = ([, value]: Entry, targets: ImmutableArray) => isInArray(value, targets);
export const isValueLess = ([, value]: Entry, target: unknown) => isLess(value, target);
export const isValueEqualLess = ([, value]: Entry, target: unknown) => isEqualLess(value, target);
export const isValueGreater = ([, value]: Entry, target: unknown) => isGreater(value, target);
export const isValueEqualGreater = ([, value]: Entry, target: unknown) => isEqualGreater(value, target);

/** Filter an iterable set of items using a matcher (and optionally a target value). */
export function yieldFiltered<L>(input: Iterable<L>, matcher: Matcher<L, void>): Iterable<L>;
export function yieldFiltered<L, R>(input: Iterable<L>, matcher: Matcher<L, R>, target: R): Iterable<L>;
export function* yieldFiltered<L, R>(input: Iterable<L>, matcher: Matcher<L, R | undefined>, target?: R): Iterable<L> {
	for (const item of input) if (match(item, matcher, target)) yield item;
}

/** Filter an array using a matcher (and optionally a target value). */
export function filterArray<L>(input: ImmutableArray<L>, matcher: Matcher<L, void>): ImmutableArray<L>;
export function filterArray<L, R>(input: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filterArray<L, R>(input: ImmutableArray<L>, matcher: Matcher<L, R | undefined>, target?: R): ImmutableArray<L> {
	if (!input.length) return input;
	const output = Array.from(yieldFiltered(input, matcher, target));
	return output.length === input.length ? input : output;
}

/** Filter an object _by its values_ using a matcher (and optionally a target value). */
export function filterObject<L>(object: ImmutableObject<L>, matcher: Matcher<Entry<L>, void>): ImmutableObject<L>;
export function filterObject<L, R>(object: ImmutableObject<L>, matcher: Matcher<Entry<L>, R>, target: R): ImmutableObject<L>;
export function filterObject<L, R>(object: ImmutableObject<L>, matcher: Matcher<Entry<L>, R | undefined>, target?: R): ImmutableObject<L> {
	return Object.fromEntries(yieldFiltered(Object.entries(object), matcher, target));
}

/** Filter a map _by its values_ using a matcher (and optionally a target value). */
export function filterMap<L>(input: ImmutableMap<L>, matcher: Matcher<Entry<L>, void>): ImmutableMap<L>;
export function filterMap<L, R>(input: ImmutableMap<L>, matcher: Matcher<Entry<L>, R>, target: R): ImmutableMap<L>;
export function filterMap<L, R>(input: ImmutableMap<L>, matcher: Matcher<Entry<L>, R | undefined>, target?: R): ImmutableMap<L> {
	if (!input.size) return input;
	const output = new Map(yieldFiltered(input, matcher, target));
	return output.size === input.size ? input : output;
}

/** Derive a value and match it against a target value. */
export class TransformMatcher<L, LL, R> implements Matchable<L, R> {
	private _transformer: Transformer<L, LL>;
	private _matcher: Matcher<LL, R>;
	constructor(transformer: Transformer<L, LL>, matcher: Matcher<LL, R> = isEqual) {
		this._transformer = transformer;
		this._matcher = matcher;
	}
	match(item: L, target: R): boolean {
		return match(transform(item, this._transformer), this._matcher, target);
	}
}
