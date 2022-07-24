import type { ImmutableArray } from "./array.js";
import { EmptyData } from "./data.js";
import type { Matchable } from "./match.js";
import { getWords, simplifyString } from "./string.js";

// Regular expressions.
export const MATCH_LINE = /[^\n]*/; // Match line of content (anything that's not a newline).
export const MATCH_LINE_START = /^\n*|\n+/; // Starts at start of line (one or more linebreak or start of string).
export const MATCH_LINE_END = /\n+|$/; // Ends at end of line (one or more linebreak or end of string).
export const MATCH_BLOCK = /[\s\S]*?/; // Match block of content (including newlines so don't be greedy).
export const MATCH_BLOCK_START = /^\n*|\n+/; // Starts at start of a block (one or more linebreak or start of string).
export const MATCH_BLOCK_END = /\n*$|\n\n+/; // End of a block (two or more linebreaks or end of string).
export const MATCH_TEXT = /\S(?:[\s\S]*?\S)?/; // Run of text that starts and ends with non-space characters (possibly multi-line).

/** Set of named match groups from a regular expression. */
export type NamedRegExpData = { [named: string]: string | undefined };

/** Regular expression match array that you've asserted contains the specified named groups. */
export interface NamedRegExpArray<T extends NamedRegExpData> extends Omit<RegExpExecArray, "groups"> {
	readonly groups?: T;
}

/** Regular expression that you've asserted contains the specified named capture groups. */
export interface NamedRegExp<T extends NamedRegExpData> extends Omit<RegExp, "exec"> {
	exec(input: string): NamedRegExpArray<T> | null;
}

/**
 * Convert a string to a regular expression that matches that string.
 *
 * @param pattern The input string.
 * @param flags RegExp flags that are passed into the created RegExp.
 */
export const toRegExp = (pattern: string, flags = ""): RegExp => new RegExp(escapeRegExp(pattern), flags);

/** Escape special characters in a string regular expression. */
export const escapeRegExp = (pattern: string): string => pattern.replace(REPLACE_ESCAPED, "\\$&");
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/** Create a named regular expression (note: this is unsafe). */
export const getNamedRegExp = <T extends NamedRegExpData>(pattern: string | RegExp, flags?: string): NamedRegExp<T> => (typeof pattern === "string" ? new RegExp(pattern, flags) : pattern) as NamedRegExp<T>;

/** Create regular expression that matches a block of content. */
export const getBlockRegExp = <T extends NamedRegExpData = EmptyData>(middle = MATCH_BLOCK.source, end = MATCH_BLOCK_END.source, start = MATCH_BLOCK_START.source): NamedRegExp<T> => getNamedRegExp(`(?:${start})(?:${middle})(?:${end})`);

/** Create regular expression that matches a line of content. */
export const getLineRegExp = <T extends NamedRegExpData = EmptyData>(middle = MATCH_LINE.source, end = MATCH_LINE_END.source, start = MATCH_LINE_START.source): NamedRegExp<T> => getNamedRegExp(`(?:${start})(?:${middle})(?:${end})`);

/** Create regular expression that matches piece of text wrapped by a set of characters (use `text` match group). */
export const getWrapRegExp = (wrapper: string, middle = MATCH_TEXT.source): NamedRegExp<{ text: string }> => getNamedRegExp(`(${wrapper})(?<text>${middle})\\1`);

/**
 * Convert a string query to the corresponding set of case-insensitive regular expressions.
 * - Splies the query into words (respecting "quoted phrases").
 * - Return a regex for each word or quoted phrase.
 * - Unquoted words match partially (starting with a word boundary).
 * - Quoted phrases match fully (starting and ending with a word boundary).
 */
export const toWordRegExps = (query: string): ImmutableArray<RegExp> => getWords(query).map(toWordRegExp);

/** Convert a string to a regular expression matching the start of a word boundary. */
export const toWordRegExp = (word: string) => new RegExp(`\\b${escapeRegExp(simplifyString(word))}`, "i");

/**
 * Match an item matching all words in a query.
 *
 * @param item The item to search for the query in.
 * @param query The query string to search for.
 * - Supports `"compound queries"` with quotes.
 */
export function matchesAll(item: unknown, regexps: Iterable<RegExp>): boolean {
	let count = 0;
	if (typeof item === "string") {
		for (const regexp of regexps) {
			count++;
			if (!regexp.test(item)) return false;
		}
	}
	return count ? true : false;
}

/**
 * Match an item any of several regular expressions.
 *
 * @param item The item to search for the query in.
 * @param regexps An iterable set of regular expressions.
 */
export function matchesAny(item: unknown, regexps: Iterable<RegExp>): boolean {
	if (typeof item === "string") for (const regexp of regexps) if (regexp.test(item)) return true;
	return false;
}

/** Matcher that matches any words in a string. */
export class MatchAnyWord implements Matchable<unknown, void> {
	private _regexps: Iterable<RegExp>;
	constructor(words: string) {
		this._regexps = toWordRegExps(words);
	}
	match(value: string): boolean {
		return matchesAny(value, this._regexps);
	}
}

/** Matcher that matches all words in a string. */
export class MatchAllWords implements Matchable<unknown, void> {
	private _regexps: Iterable<RegExp>;
	constructor(words: string) {
		this._regexps = toWordRegExps(words);
	}
	match(value: string): boolean {
		return matchesAll(value, this._regexps);
	}
}

/** Matcher that matches an exact phrase. */
export class MatchWord implements Matchable<unknown, void> {
	private _regexp: RegExp;
	constructor(phrase: string) {
		this._regexp = toWordRegExp(phrase);
	}
	match(value: string): boolean {
		return this._regexp.test(value);
	}
}
