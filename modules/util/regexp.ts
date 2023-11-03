import type { Match } from "./match.js";
import type { NotString } from "./string.js";
import { ValueError } from "../error/ValueError.js";
import { getArray } from "./array.js";

/** Regular expression that always matches everything. */
export const ALWAYS_REGEXP = /^.*$/;

/** Regular expression that never matches anything. */
export const NEVER_REGEXP = /^(?=a)a/;

/** Things that can be convert to a regular expression. */
export type PossibleRegExp = string | RegExp;

/** Is an unknown value a `RegExp` instance? */
export const isRegExp = (value: unknown): value is RegExp => value instanceof RegExp;

/** Assert that an unknown value is a `RegExp` instance. */
export function assertRegExp(value: unknown): asserts value is RegExp {
	if (!(value instanceof RegExp)) throw new ValueError("Must be regular expression", value);
}

/** Convert a string to a regular expression that matches that string. */
export function getRegExp<T extends string>(pattern: `(?<${T}>${string})`, flags?: string): NamedRegExp<{ [K in T]: string }>; // Detect named capturing groups.
export function getRegExp(pattern: PossibleRegExp, flags?: string): RegExp;
export function getRegExp(pattern: PossibleRegExp, flags?: string): RegExp {
	return typeof pattern === "string" ? new RegExp(pattern, flags) : pattern;
}

/** Convert a regular expression to its string source. */
export const getRegExpSource = (regexp: PossibleRegExp): string => (typeof regexp === "string" ? regexp : regexp.source);

/** Escape special characters in a string regular expression. */
export const escapeRegExp = (pattern: string): string => pattern.replace(REPLACE_ESCAPED, "\\$&");
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/** Create regular expression that matches any of a list of other expressions. */
export function getAnyRegExp(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = getArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _no_ string can ever match against any of nothing.
	if (!arr.length) return NEVER_REGEXP;
	// Create RegExp using multiple joined matches like `(?:AAA)|(?:BBB)`
	return new RegExp(`(?:${getArray(patterns).map(getRegExpSource).join(")|(?:")})`, flags);
}

/** Create regular expression that matches all of a list of other expressions. */
export function getAllRegExp(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = getArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _every_ string will match against the entire list of nothing.
	if (!arr.length) return ALWAYS_REGEXP;
	// Create RegExp using multiple lookaheads like `^(?=.*?(?:AAA))(?=.*?(?:BBB))`
	return new RegExp(`^(?=.*?(?:${getArray(patterns).map(getRegExpSource).join("))(?=.*?(?:")}))`, flags);
}

/** Match function for finding strings that match against regular expressions (use with `filter()` to positively filter iterable sets of items). */
export const isRegExpMatch: Match<[item: string, target: RegExp]> = (item, target) => target.test(item);

/** Match function for finding strings that match against regular expressions (use with `filter()` to negatively filter iterable sets of items). */
export const notRegExpMatch: Match<[item: string, target: RegExp]> = (item, target) => !target.test(item);

/** Regular expression match array that you've asserted contains the specified named groups. */
export interface TypedRegExpExecArray<T extends string = string> extends RegExpExecArray {
	0: T;
}

/** Regular expression that you've asserted contains the specified named capture groups. */
export interface TypedRegExp<T extends string = string> extends RegExp {
	exec(input: string): TypedRegExpExecArray<T> | null;
}

/** Set of named match groups from a regular expression. */
export type NamedRegExpData = { [named: string]: string };

/** Regular expression match array that you've asserted contains the specified named groups. */
export interface NamedRegExpExecArray<T extends NamedRegExpData = NamedRegExpData> extends RegExpExecArray {
	groups: T; // Groups is always set if a single `(?<named> placeholder)` appears in the RegExp.
}

/** Regular expression that you've asserted contains the specified named capture groups. */
export interface NamedRegExp<T extends NamedRegExpData = NamedRegExpData> extends RegExp {
	exec(input: string): NamedRegExpExecArray<T> | null;
}
