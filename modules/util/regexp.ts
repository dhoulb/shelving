import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import { requireArray } from "./array.js";
import type { NotString } from "./string.js";

/** Regular expression that always matches everything. */
export const ALWAYS_REGEXP = /^.*$/;

/** Regular expression that never matches anything. */
export const NEVER_REGEXP = /^(?=a)a/;

/** Things that can be convert to a regular expression. */
export type PossibleRegExp = string | RegExp;

/** Is an unknown value a `RegExp` instance? */
export function isRegExp(value: unknown): value is RegExp {
	return value instanceof RegExp;
}

/** Assert that an unknown value is a `RegExp` instance. */
export function assertRegExp(value: unknown): asserts value is RegExp {
	if (!(value instanceof RegExp)) throw new RequiredError("Must be regular expression", { received: value, caller: assertRegExp });
}

/** Convert a string to a regular expression that matches that string. */
export function getRegExp<T extends NamedRegExpData>(
	pattern: NamedRegExp<T>,
	flags?: string,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getRegExp<T extends NamedRegExpData | undefined = undefined>(
	pattern: PossibleRegExp,
	flags?: string,
): T extends NamedRegExpData ? NamedRegExp<T> : RegExp;
export function getRegExp(pattern: PossibleRegExp, flags?: string): RegExp {
	return typeof pattern === "string" ? new RegExp(pattern, flags) : pattern;
}

/** Convert a regular expression to its string source. */
export function getRegExpSource(regexp: PossibleRegExp): string {
	return typeof regexp === "string" ? regexp : regexp.source;
}

/** Escape special characters in a string regular expression. */
export function escapeRegExp(pattern: string): string {
	return pattern.replace(REPLACE_ESCAPED, "\\$&");
}
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/** Create regular expression that matches any of a list of other expressions. */
export function createRegExpAny(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = requireArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _no_ string can ever match against any of nothing.
	if (!arr.length) return NEVER_REGEXP;
	// Create RegExp using multiple joined matches like `(?:AAA)|(?:BBB)`
	return new RegExp(`(?:${requireArray(patterns).map(getRegExpSource).join(")|(?:")})`, flags);
}

/** Create regular expression that matches all of a list of other expressions. */
export function createRegExpAll(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = requireArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _every_ string will match against the entire list of nothing.
	if (!arr.length) return ALWAYS_REGEXP;
	// Create RegExp using multiple lookaheads like `^(?=.*?(?:AAA))(?=.*?(?:BBB))`
	return new RegExp(`^(?=.*?(?:${requireArray(patterns).map(getRegExpSource).join("))(?=.*?(?:")}))`, flags);
}

/** Regular expression match array that matches a specific string format. */
export interface TypedRegExpExecArray<T extends string = string> extends RegExpExecArray {
	0: T;
}

/** Regular expression that matches a specific string format. */
export interface TypedRegExp<T extends string = string> extends RegExp {
	exec(input: string): TypedRegExpExecArray<T> | null;
}

/** Set of named match groups from a regular expression. */
export type NamedRegExpData = { [named: string]: string };

/** Regular expression match array that contains the specified named groups. */
export interface NamedRegExpExecArray<T extends NamedRegExpData = NamedRegExpData> extends RegExpExecArray {
	groups: T; // Groups is always set if a single `(?<named> placeholder)` appears in the RegExp.
}

/** Regular expression that contains the specified named capture groups. */
export interface NamedRegExp<T extends NamedRegExpData = NamedRegExpData> extends RegExp {
	exec(input: string): NamedRegExpExecArray<T> | null;
}

/** Match function for finding strings that match against regular expressions (use with `filter()` to positively filter iterable sets of items). */
export function isMatch(str: string, regexp: RegExp): boolean {
	return regexp.test(str);
}

/** Match function for finding strings that match against regular expressions (use with `filter()` to negatively filter iterable sets of items). */
export function notMatch(str: string, regexp: RegExp): boolean {
	return !regexp.test(str);
}

/** Get an optional regular expression match, or `undefined` if no match could be made. */
export function getMatch<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): NamedRegExpExecArray<T> | undefined;
export function getMatch<T extends string>(str: string, regexp: TypedRegExp<T>): TypedRegExpExecArray<T> | undefined;
export function getMatch(str: string, regexp: RegExp): RegExpExecArray | undefined;
export function getMatch(str: string, regexp: RegExp): RegExpExecArray | undefined {
	return regexp.exec(str) || undefined;
}

/** Get a required regular expression match, or throw `ValueError` if no match could be made. */
export function requireMatch<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): NamedRegExpExecArray<T>;
export function requireMatch<T extends string>(str: string, regexp: TypedRegExp<T>): TypedRegExpExecArray<T>;
export function requireMatch(str: string, regexp: RegExp): RegExpExecArray;
export function requireMatch(str: string, regexp: RegExp): RegExpExecArray {
	const match = getMatch(str, regexp);
	if (!match) throw new ValueError("Must match regular expression", { received: str, expected: regexp, caller: requireMatch });
	return match;
}

/** Get an optional regular expression match, or `undefined` if no match could be made. */
export function getMatchGroups<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): T | undefined;
export function getMatchGroups(str: string, regexp: RegExp): NamedRegExpData | undefined;
export function getMatchGroups(str: string, regexp: RegExp): NamedRegExpData | undefined {
	return regexp.exec(str)?.groups || undefined;
}

/** Get a required regular expression match, or throw `ValueError` if no match could be made. */
export function requireMatchGroups<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): T;
export function requireMatchGroups(str: string, regexp: RegExp): NamedRegExpData;
export function requireMatchGroups(str: string, regexp: RegExp): NamedRegExpData {
	const groups = getMatchGroups(str, regexp);
	if (!groups) throw new ValueError("Must match regular expression", { received: str, expected: regexp, caller: requireMatchGroups });
	return groups;
}
