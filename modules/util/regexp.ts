import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import { type ImmutableArray, requireArray } from "./array.js";
import { isNullish, type Nullish } from "./null.js";
import type { NotString } from "./string.js";

/**
 * A thing that a string can be matched against.
 * - Either a `RegExp` instance, or a `string` that is matched using `===` equality.
 *
 * @see https://shelving.cc/util/regexp/Matchable
 */
export type Matchable = string | RegExp;

/**
 * A list of things that strings can be matched against.
 *
 * @see https://shelving.cc/util/regexp/Matchables
 */
export type Matchables = ImmutableArray<Nullish<Matchable>>;

/**
 * Regular expression that always matches everything.
 *
 * @see https://shelving.cc/util/regexp/ALWAYS_REGEXP
 */
export const ALWAYS_REGEXP = /^.*$/;

/**
 * Regular expression that never matches anything.
 *
 * @see https://shelving.cc/util/regexp/NEVER_REGEXP
 */
export const NEVER_REGEXP = /^(?=a)a/;

/**
 * Things that can be converted to a regular expression.
 * - Either a `RegExp` instance, or a `string` source for a regular expression.
 *
 * @see https://shelving.cc/util/regexp/PossibleRegExp
 */
export type PossibleRegExp = string | RegExp;

/**
 * Is an unknown value a `RegExp` instance?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a `RegExp` instance, narrowing its type.
 * @see https://shelving.cc/util/regexp/isRegExp
 */
export function isRegExp(value: unknown): value is RegExp {
	return value instanceof RegExp;
}

/**
 * Assert that an unknown value is a `RegExp` instance.
 *
 * @param value The value to assert.
 * @throws {RequiredError} If `value` is not a `RegExp` instance.
 * @see https://shelving.cc/util/regexp/assertRegExp
 */
export function assertRegExp(value: unknown): asserts value is RegExp {
	if (!(value instanceof RegExp)) throw new RequiredError("Must be regular expression", { received: value, caller: assertRegExp });
}

/**
 * Convert a possible regular expression into a `RegExp` instance.
 * - If `pattern` is a `string` a new `RegExp` is created from it, otherwise it is returned as-is.
 *
 * @param pattern The regular expression or string source to convert.
 * @param flags The flags to use when creating a `RegExp` from a string source.
 * @returns The corresponding `RegExp` instance.
 * @see https://shelving.cc/util/regexp/getRegExp
 */
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

/**
 * Convert a regular expression to its string source.
 * - If `regexp` is a `string` it is returned as-is, otherwise its `.source` is returned.
 *
 * @param regexp The regular expression or string source to read.
 * @returns The string source of the regular expression.
 * @see https://shelving.cc/util/regexp/getRegExpSource
 */
export function getRegExpSource(regexp: PossibleRegExp): string {
	return typeof regexp === "string" ? regexp : regexp.source;
}

/**
 * Escape special characters in a string regular expression.
 * - Escapes any characters that have special meaning in a regular expression so the string matches literally.
 *
 * @param pattern The string to escape.
 * @returns The escaped string, safe to use as a literal regular expression source.
 * @see https://shelving.cc/util/regexp/escapeRegExp
 */
export function escapeRegExp(pattern: string): string {
	return pattern.replace(REPLACE_ESCAPED, "\\$&");
}
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/**
 * Create a regular expression that matches any one of a list of other expressions.
 * - If the list is empty the returned expression matches nothing (`NEVER_REGEXP`).
 *
 * @param patterns The regular expressions or string sources to combine.
 * @param flags The flags to use when creating the combined `RegExp`.
 * @returns A `RegExp` that matches if any of the provided expressions match.
 * @see https://shelving.cc/util/regexp/createRegExpAny
 */
export function createRegExpAny(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = requireArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _no_ string can ever match against any of nothing.
	if (!arr.length) return NEVER_REGEXP;
	// Create RegExp using multiple joined matches like `(?:AAA)|(?:BBB)`
	return new RegExp(`(?:${requireArray(patterns).map(getRegExpSource).join(")|(?:")})`, flags);
}

/**
 * Create a regular expression that matches all of a list of other expressions.
 * - If the list is empty the returned expression matches everything (`ALWAYS_REGEXP`).
 *
 * @param patterns The regular expressions or string sources to combine.
 * @param flags The flags to use when creating the combined `RegExp`.
 * @returns A `RegExp` that matches only if all of the provided expressions match.
 * @see https://shelving.cc/util/regexp/createRegExpAll
 */
export function createRegExpAll(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = requireArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _every_ string will match against the entire list of nothing.
	if (!arr.length) return ALWAYS_REGEXP;
	// Create RegExp using multiple lookaheads like `^(?=.*?(?:AAA))(?=.*?(?:BBB))`
	return new RegExp(`^(?=.*?(?:${requireArray(patterns).map(getRegExpSource).join("))(?=.*?(?:")}))`, flags);
}

/**
 * Regular expression match array whose full match is a specific string format.
 *
 * @see https://shelving.cc/util/regexp/TypedRegExpExecArray
 */
export interface TypedRegExpExecArray<T extends string = string> extends RegExpExecArray {
	0: T;
}

/**
 * Regular expression that matches a specific string format.
 *
 * @see https://shelving.cc/util/regexp/TypedRegExp
 */
export interface TypedRegExp<T extends string = string> extends RegExp {
	exec(input: string): TypedRegExpExecArray<T> | null;
}

/**
 * Set of named match groups from a regular expression.
 *
 * @see https://shelving.cc/util/regexp/NamedRegExpData
 */
export type NamedRegExpData = { [named: string]: string };

/**
 * Regular expression match array that contains the specified named groups.
 *
 * @see https://shelving.cc/util/regexp/NamedRegExpExecArray
 */
export interface NamedRegExpExecArray<T extends NamedRegExpData = NamedRegExpData> extends RegExpExecArray {
	groups: T; // Groups is always set if a single `(?<named> placeholder)` appears in the RegExp.
}

/**
 * Regular expression that contains the specified named capture groups.
 *
 * @see https://shelving.cc/util/regexp/NamedRegExp
 */
export interface NamedRegExp<T extends NamedRegExpData = NamedRegExpData> extends RegExp {
	exec(input: string): NamedRegExpExecArray<T> | null;
}

/**
 * Does a string match against a regular expressions or string.
 * - Use with `filter()` to positively filter iterable sets of items.
 *
 * @param str String to test against the regular expression.
 * @param regexp Regular expression to test against the string.
 * - If `regexp` is a `RegExp` it is tested against the string using `RegExp.test()`.
 * - If `regexp` is a `string` it is simply tested against the string using `===` equality.
 * @returns `true` if the string matches the regular expression, otherwise `false`.
 * @see https://shelving.cc/util/regexp/isMatch
 */
export function isMatch(str: string, regexp: Matchable): boolean {
	return typeof regexp === "string" ? regexp === str : regexp.test(str);
}

/**
 * Does a string not match against a regular expressions or string.
 * - Use with `filter()` to negatively filter iterable sets of items.
 *
 * @param str String to test against the regular expression.
 * @param regexp Regular expression to test against the string.
 * - If `regexp` is a `RegExp` it is tested against the string using `RegExp.test()`.
 * - If `regexp` is a `string` it is simply tested against the string using `!==` equality.
 * @returns `true` if the string does not match the regular expression, otherwise `false`.
 * @see https://shelving.cc/util/regexp/notMatch
 */
export function notMatch(str: string, regexp: Matchable): boolean {
	return !isMatch(str, regexp);
}

/**
 * All of the provided regular expressions match the string.
 *
 * @param str String to test against the regular expressions.
 * @param regexps - Regular expressions to match against the string.
 * - If empty the function returns `true` (since all zero of the provided regexps match everything).
 * - If a `RegExp` it is tested against the string using `RegExp.test()`.
 * - If a `string` it is simply tested against the string using `===` equality.
 * - If `null` or `undefined` it is ignored.
 * @returns `true` if every provided regular expression matches the string, otherwise `false`.
 * @see https://shelving.cc/util/regexp/allMatch
 */
export function allMatch(str: string, ...regexps: Matchables): boolean {
	for (const x of regexps) {
		if (isNullish(x)) continue;
		if (!isMatch(str, x)) return false;
	}
	return true;
}

/**
 * At least one of the provided regular expressions matches the string.
 *
 * @param str String to test against the regular expressions.
 * @param regexps - Regular expressions to match against the string.
 * - If empty the function returns `false` (since none of zero provided regexps can match).
 * - If a `RegExp` it is tested against the string using `RegExp.test()`.
 * - If a `string` it is simply tested against the string using `===` equality.
 * - If `null` or `undefined` it is ignored.
 * @returns `true` if at least one provided regular expression matches the string, otherwise `false`.
 * @see https://shelving.cc/util/regexp/anyMatch
 */
export function anyMatch(str: string, ...regexps: Matchables): boolean {
	for (const x of regexps) {
		if (isNullish(x)) continue;
		if (isMatch(str, x)) return true;
	}
	return false;
}

/**
 * None of the provided regular expressions match the string.
 *
 * @param str String to test against the regular expressions.
 * @param regexps - Regular expressions to match against the string.
 * - If empty the function returns `false` (since the empty list of regexps matches everything).
 * - If a `RegExp` it is tested against the string using `RegExp.test()`.
 * - If a `string` it is simply tested against the string using `===` equality.
 * - If `null` or `undefined` it is ignored.
 * @returns `true` if none of the provided regular expressions match the string, otherwise `false`.
 * @see https://shelving.cc/util/regexp/noneMatch
 */
export function noneMatch(str: string, ...regexps: Matchables): boolean {
	return !allMatch(str, ...regexps);
}

/**
 * Get an optional regular expression match, or `undefined` if no match could be made.
 *
 * @param str String to match against the regular expression.
 * @param regexp Regular expression to match against the string.
 * @returns The match array, or `undefined` if the string did not match.
 * @see https://shelving.cc/util/regexp/getMatch
 */
export function getMatch<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): NamedRegExpExecArray<T> | undefined;
export function getMatch<T extends string>(str: string, regexp: TypedRegExp<T>): TypedRegExpExecArray<T> | undefined;
export function getMatch(str: string, regexp: RegExp): RegExpExecArray | undefined;
export function getMatch(str: string, regexp: RegExp): RegExpExecArray | undefined {
	return regexp.exec(str) || undefined;
}

/**
 * Get a required regular expression match, or throw `ValueError` if no match could be made.
 *
 * @param str String to match against the regular expression.
 * @param regexp Regular expression to match against the string.
 * @returns The match array.
 * @throws {ValueError} If the string did not match the regular expression.
 * @see https://shelving.cc/util/regexp/requireMatch
 */
export function requireMatch<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): NamedRegExpExecArray<T>;
export function requireMatch<T extends string>(str: string, regexp: TypedRegExp<T>): TypedRegExpExecArray<T>;
export function requireMatch(str: string, regexp: RegExp): RegExpExecArray;
export function requireMatch(str: string, regexp: RegExp): RegExpExecArray {
	const match = getMatch(str, regexp);
	if (!match) throw new ValueError("Must match regular expression", { received: str, expected: regexp, caller: requireMatch });
	return match;
}

/**
 * Get the named groups of an optional regular expression match, or `undefined` if no match could be made.
 *
 * @param str String to match against the regular expression.
 * @param regexp Regular expression to match against the string.
 * @returns The set of named match groups, or `undefined` if the string did not match.
 * @see https://shelving.cc/util/regexp/getMatchGroups
 */
export function getMatchGroups<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): T | undefined;
export function getMatchGroups(str: string, regexp: RegExp): NamedRegExpData | undefined;
export function getMatchGroups(str: string, regexp: RegExp): NamedRegExpData | undefined {
	return regexp.exec(str)?.groups || undefined;
}

/**
 * Get the named groups of a required regular expression match, or throw `ValueError` if no match could be made.
 *
 * @param str String to match against the regular expression.
 * @param regexp Regular expression to match against the string.
 * @returns The set of named match groups.
 * @throws {ValueError} If the string did not match the regular expression.
 * @see https://shelving.cc/util/regexp/requireMatchGroups
 */
export function requireMatchGroups<T extends NamedRegExpData>(str: string, regexp: NamedRegExp<T>): T;
export function requireMatchGroups(str: string, regexp: RegExp): NamedRegExpData;
export function requireMatchGroups(str: string, regexp: RegExp): NamedRegExpData {
	const groups = getMatchGroups(str, regexp);
	if (!groups) throw new ValueError("Must match regular expression", { received: str, expected: regexp, caller: requireMatchGroups });
	return groups;
}
