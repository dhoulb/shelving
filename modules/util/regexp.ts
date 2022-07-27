import { AssertionError } from "../error/AssertionError.js";
import { getArray } from "./array.js";
import { Match } from "./match.js";
import { NotString } from "./string.js";

// Regular expressions.
export const MATCH_LINE = /[^\n]*/; // Match line of content (anything that's not a newline).
export const MATCH_LINE_START = /^\n*|\n+/; // Starts at start of line (one or more linebreak or start of string).
export const MATCH_LINE_END = /\n+|$/; // Ends at end of line (one or more linebreak or end of string).
export const MATCH_BLOCK = /[\s\S]*?/; // Match block of content (including newlines so don't be greedy).
export const MATCH_BLOCK_START = /^\n*|\n+/; // Starts at start of a block (one or more linebreak or start of string).
export const MATCH_BLOCK_END = /\n*$|\n\n+/; // End of a block (two or more linebreaks or end of string).
export const MATCH_TEXT = /\S(?:[\s\S]*?\S)?/; // Run of text that starts and ends with non-space characters (possibly multi-line).
export const MATCH_ALWAYS = /^.*$/; // Regular expression that always matches.
export const MATCH_NEVER = /^(?=a)a/; // Regular expression that never matches.

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
	readonly 0: string; // We know the first item in the array will always be a string (otherwise it wouldn't have matched).
	readonly groups: T; // Groups is always set if a single `(?<named> placeholder)` appears in the RegExp.
}

/** Regular expression that you've asserted contains the specified named capture groups. */
export interface NamedRegExp<T extends NamedRegExpData = NamedRegExpData> extends RegExp {
	exec(input: string): NamedRegExpArray<T> | null;
}

/** Create a named regular expression (note: this is unsafe). */
export const getNamedRegExp = <T extends NamedRegExpData>(pattern: string | RegExp, flags?: string): NamedRegExp<T> => (typeof pattern === "string" ? new RegExp(pattern, flags) : pattern) as NamedRegExp<T>;

/** Create regular expression that matches a block of content (possibly asserting that it contains named match groups). */
export function getBlockRegExp<T extends NamedRegExpData>(middle: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp, flags?: string): NamedRegExp<T>;
export function getBlockRegExp(middle: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp, flags?: string): RegExp;
export function getBlockRegExp(middle: PossibleRegExp = MATCH_BLOCK, end: PossibleRegExp = MATCH_BLOCK_END, start: PossibleRegExp = MATCH_BLOCK_START, flags?: string): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(middle)})(?:${getRegExpSource(end)})`, flags);
}

/** Create regular expression that matches a line of content (possibly asserting that it contains named match groups). */
export function getLineRegExp<T extends NamedRegExpData>(middle: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp, flags?: string): NamedRegExp<T>;
export function getLineRegExp(middle: PossibleRegExp, end?: PossibleRegExp, start?: PossibleRegExp, flags?: string): RegExp;
export function getLineRegExp(middle: PossibleRegExp = MATCH_LINE, end: PossibleRegExp = MATCH_LINE_END, start: PossibleRegExp = MATCH_LINE_START, flags?: string): RegExp {
	return new RegExp(`(?:${getRegExpSource(start)})(?:${getRegExpSource(middle)})(?:${getRegExpSource(end)})`, flags);
}

/** Create regular expression that matches piece of text wrapped by another expression (use `text` match group). */
export function getWrapRegExp(wrapper: PossibleRegExp, middle: PossibleRegExp = MATCH_TEXT, flags?: string): NamedRegExp<{ text: string }> {
	return getNamedRegExp(`(${getRegExpSource(wrapper)})(?<text>${getRegExpSource(middle)})\\1`, flags);
}

/** Create regular expression that matches any of a list of other expressions. */
export function getAnyRegExp(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = getArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _no_ string can ever match against any of nothing.
	if (!arr.length) return MATCH_NEVER;
	// Create RegExp using multiple joined matches like `(?:AAA)|(?:BBB)`
	return new RegExp(`(?:${getArray(patterns).map(getRegExpSource).join(")|(?:")})`, flags);
}

/** Create regular expression that matches all of a list of other expressions. */
export function getAllRegExp(patterns: Iterable<PossibleRegExp> & NotString, flags?: string): RegExp {
	const arr = getArray(patterns).filter(Boolean);
	// If there are no patterns to match against then _every_ string will match against the entire list of nothing.
	if (!arr.length) return MATCH_ALWAYS;
	// Create RegExp using multiple lookaheads like `^(?=.*?(?:AAA))(?=.*?(?:BBB))`
	return new RegExp(`^(?=.*?(?:${getArray(patterns).map(getRegExpSource).join("))(?=.*?(?:")}))`, flags);
}

/** Match function for finding strings that match against regular expressions (use with `filter()` to positively filter iterable sets of items). */
export const isRegExpMatch: Match<string, RegExp> = (item, target) => target.test(item);

/** Match function for finding strings that match against regular expressions (use with `filter()` to negatively filter iterable sets of items). */
export const notRegExpMatch: Match<string, RegExp> = (item, target) => !target.test(item);
