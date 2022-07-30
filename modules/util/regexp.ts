import { AssertionError } from "../error/AssertionError.js";
import { getArray } from "./array.js";
import { Match } from "./match.js";
import { NotString } from "./string.js";

/** Regular expression that always matches everything. */
export const ALWAYS_REGEXP = /^.*$/;

/** Regular expression that never matches anything. */
export const NEVER_REGEXP = /^(?=a)a/;

/** Things that can be convert to a regular expression. */
export type PossibleRegExp = string | RegExp;

/** Is an unknown value a `RegExp` instance? */
export const isRegExp = <T extends RegExp>(v: T | unknown): v is T => v instanceof RegExp;

/** Assert that an unknown value is a `RegExp` instance. */
export function assertRegExp<T extends RegExp>(v: T | unknown): asserts v is T {
	if (!(v instanceof RegExp)) throw new AssertionError("Must be regular expression", v);
}

/** Convert a string to a regular expression that matches that string. */
export const getRegExp = (pattern: PossibleRegExp, flags?: string): RegExp => (typeof pattern === "string" ? new RegExp(pattern, flags) : pattern);

/** Convert a regular expression to its string source. */
export const getRegExpSource = (regexp: PossibleRegExp): string => (typeof regexp === "string" ? regexp : regexp.source);

/** Escape special characters in a string regular expression. */
export const escapeRegExp = (pattern: string): string => pattern.replace(REPLACE_ESCAPED, "\\$&");
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/** Set of named match groups from a regular expression. */
export type NamedRegExpData = { [named: string]: string };

/** Regular expression match array that you've asserted contains the specified named groups. */
export interface NamedRegExpArray<T extends NamedRegExpData = NamedRegExpData> extends RegExpExecArray {
	0: string; // We know the first item in the array will always be a string (otherwise it wouldn't have matched).
	groups: T; // Groups is always set if a single `(?<named> placeholder)` appears in the RegExp.
}

/** Regular expression that you've asserted contains the specified named capture groups. */
export interface NamedRegExp<T extends NamedRegExpData = NamedRegExpData> extends RegExp {
	exec(input: string): NamedRegExpArray<T> | null;
}

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
export const isRegExpMatch: Match<string, RegExp> = (item, target) => target.test(item);

/** Match function for finding strings that match against regular expressions (use with `filter()` to negatively filter iterable sets of items). */
export const notRegExpMatch: Match<string, RegExp> = (item, target) => !target.test(item);
