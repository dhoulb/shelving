import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import { Entry } from "./entry.js";
import { ImmutableObject } from "./object.js";
import { ASC } from "./sort.js";
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
export const IS = (item: unknown, target: unknown) => item === target;
export const NOT = (item: unknown, target: unknown) => item !== target;
export const IN = (item: unknown, targets: ImmutableArray) => targets.includes(item);
export const CONTAINS = (items: unknown, target: unknown) => items instanceof Array && items.includes(target);
export const LT = (item: unknown, target: unknown) => ASC(item, target) < 0;
export const LTE = (item: unknown, target: unknown) => ASC(item, target) <= 0;
export const GT = (item: unknown, target: unknown) => ASC(item, target) > 0;
export const GTE = (item: unknown, target: unknown) => ASC(item, target) >= 0;

// Entry key matchers.
export const KEY_IS = ([key]: Entry, target: string) => IS(key, target);
export const KEY_NOT = ([key]: Entry, targets: ImmutableArray<string>) => IN(key, targets);
export const KEY_IN = ([key]: Entry, targets: ImmutableArray<string>) => IN(key, targets);
export const KEY_LT = ([key]: Entry, target: unknown) => LT(key, target);
export const KEY_LTE = ([key]: Entry, target: unknown) => LTE(key, target);
export const KEY_GT = ([key]: Entry, target: unknown) => GT(key, target);
export const KEY_GTE = ([key]: Entry, target: unknown) => GTE(key, target);

// Entry value matchers.
export const VALUE_IS = ([, value]: Entry, target: unknown) => IS(value, target);
export const VALUE_NOT = ([, value]: Entry, target: unknown) => NOT(value, target);
export const VALUE_IN = ([, value]: Entry, targets: ImmutableArray) => IN(value, targets);
export const VALUE_LT = ([, value]: Entry, target: unknown) => LT(value, target);
export const VALUE_LTE = ([, value]: Entry, target: unknown) => LTE(value, target);
export const VALUE_GT = ([, value]: Entry, target: unknown) => GT(value, target);
export const VALUE_GTE = ([, value]: Entry, target: unknown) => GTE(value, target);

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
	constructor(transformer: Transformer<L, LL>, matcher: Matcher<LL, R> = IS) {
		this._transformer = transformer;
		this._matcher = matcher;
	}
	match(item: L, target: R): boolean {
		return match(transform(item, this._transformer), this._matcher, target);
	}
}
