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

/** Match whether an item is equal to a target. */
export const IS = (item: unknown, target: unknown) => item === target;

/** Match whether an item is not equal to match a target. */
export const NOT = (item: unknown, target: unknown) => item !== target;

/** Match whether an item exists in an array of targets. */
export const IN = (item: unknown, targets: ImmutableArray) => targets.includes(item);

/** Match whether an array of items contains a target. */
export const CONTAINS = (items: unknown, target: unknown) => items instanceof Array && items.includes(target);

/** Match whether an item is less than a target. */
export const LT = (item: unknown, target: unknown) => ASC(item, target) < 0;

/** Match whether an item is less than or equal to a target. */
export const LTE = (item: unknown, target: unknown) => ASC(item, target) <= 0;

/** Match whether an item is greater than a target. */
export const GT = (item: unknown, target: unknown) => ASC(item, target) > 0;

/** Match whether an item is greater than or equal to a target. */
export const GTE = (item: unknown, target: unknown) => ASC(item, target) >= 0;

/** Match whether the key of an entry is equal to a target. */
export const KEY_IS = ([item]: Entry, target: string) => item === target;

/** Match whether the key of an entry is in an array of targets. */
export const KEY_IN = ([item]: Entry, targets: ImmutableArray<string>) => targets.includes(item);

/** Match whether the value of an entry is equal to a target. */
export const VALUE_IS = ([, item]: Entry, target: unknown) => item === target;

/** Match whether the value of an entry is in an array of targets. */
export const VALUE_IN = ([, item]: Entry, targets: ImmutableArray) => targets.includes(item);

/** Match whether the value of an entry is defined. */
export const VALUE_DEFINED = ([, item]: Entry) => item !== undefined;

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
