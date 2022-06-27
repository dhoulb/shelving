import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import type { Entry } from "./entry.js";
import type { ImmutableObject } from "./object.js";
import { match, Matcher } from "./match.js";

/** Filter an iterable set of items using a matcher (and optionally a target value). */
export function filterItems<L>(input: Iterable<L>, matcher: Matcher<L, void>): Iterable<L>;
export function filterItems<L, R>(input: Iterable<L>, matcher: Matcher<L, R>, target: R): Iterable<L>;
export function* filterItems<L, R>(input: Iterable<L>, matcher: Matcher<L, R | undefined>, target?: R): Iterable<L> {
	for (const item of input) if (match(item, matcher, target)) yield item;
}

/** Filter an array using a matcher (and optionally a target value). */
export function filterArray<L>(input: ImmutableArray<L>, matcher: Matcher<L, void>): ImmutableArray<L>;
export function filterArray<L, R>(input: ImmutableArray<L>, matcher: Matcher<L, R>, target: R): ImmutableArray<L>;
export function filterArray<L, R>(input: ImmutableArray<L>, matcher: Matcher<L, R | undefined>, target?: R): ImmutableArray<L> {
	if (!input.length) return input;
	const output = Array.from(filterItems(input, matcher, target));
	return output.length === input.length ? input : output;
}

/** Filter an object _by its values_ using a matcher (and optionally a target value). */
export function filterObject<L>(object: ImmutableObject<L>, matcher: Matcher<Entry<L>, void>): ImmutableObject<L>;
export function filterObject<L, R>(object: ImmutableObject<L>, matcher: Matcher<Entry<L>, R>, target: R): ImmutableObject<L>;
export function filterObject<L, R>(object: ImmutableObject<L>, matcher: Matcher<Entry<L>, R | undefined>, target?: R): ImmutableObject<L> {
	return Object.fromEntries(filterItems(Object.entries(object), matcher, target));
}

/** Filter a map _by its values_ using a matcher (and optionally a target value). */
export function filterMap<L>(input: ImmutableMap<L>, matcher: Matcher<Entry<L>, void>): ImmutableMap<L>;
export function filterMap<L, R>(input: ImmutableMap<L>, matcher: Matcher<Entry<L>, R>, target: R): ImmutableMap<L>;
export function filterMap<L, R>(input: ImmutableMap<L>, matcher: Matcher<Entry<L>, R | undefined>, target?: R): ImmutableMap<L> {
	if (!input.size) return input;
	const output = new Map(filterItems(input, matcher, target));
	return output.size === input.size ? input : output;
}
