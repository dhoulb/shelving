import type { ImmutableArray } from "./array.js";
import { Matchable } from "./filter.js";
import { toWords, normalizeString } from "./string.js";

// Regular expressions.
export const MATCH_SPACE = /\s+/; // Match the first run of one or more space characters.
export const MATCH_SPACES = /\s+/g; // Match all runs of one or more space characters.
export const MATCH_LINEBREAK = /\n+/; // Match the first run of one or more linebreak characters.
export const MATCH_LINEBREAKS = /\n+/; // Match all runs of one or more linebreak characters.
export const MATCH_LINE = /[^\n]*/; // Match line of content (anything that's not a newline).
export const MATCH_LINE_START = /^\n*|\n+/; // Starts at start of line (one or more linebreak or start of string).
export const MATCH_LINE_END = /\n+|$/; // Ends at end of line (one or more linebreak or end of string).
export const MATCH_BLOCK = /[\s\S]*?/; // Match block of content (including newlines so don't be greedy).
export const MATCH_BLOCK_START = /^\n*|\n+/; // Starts at start of a block (one or more linebreak or start of string).
export const MATCH_BLOCK_END = /\n*$|\n\n+/; // End of a block (two or more linebreaks or end of string).
export const MATCH_WORDS = /\S(?:[\s\S]*?\S)?/; // Run of text that starts and ends with non-space characters (possibly multi-line).

/**
 * Convert a string to a regular expression that matches that string.
 *
 * @param str The input string.
 * @param flags RegExp flags that are passed into the created RegExp.
 */
export const toRegExp = (str: string, flags = ""): RegExp => new RegExp(escapeRegExp(str), flags);

/** Escape special characters in a string regular expression. */
export const escapeRegExp = (str: string): string => str.replace(REPLACE_ESCAPED, "\\$&");
const REPLACE_ESCAPED = /[-[\]/{}()*+?.\\^$|]/g;

/** Create regular expression that matches a block of content. */
export const getBlockRegExp = (middle = MATCH_BLOCK.source, end = MATCH_BLOCK_END.source, start = MATCH_BLOCK_START.source): RegExp => new RegExp(`(?:${start})${middle}(?:${end})`);

/** Create regular expression that matches a line of content. */
export const getLineRegExp = (middle = MATCH_LINE.source, end = MATCH_LINE_END.source, start = MATCH_LINE_START.source): RegExp => new RegExp(`(?:${start})${middle}(?:${end})`);

/** Create regular expression that matches piece of text wrapped by a set of characters. */
export const getWrapRegExp = (chars: string, middle = MATCH_WORDS.source): RegExp => new RegExp(`(${chars})(${middle})\\1`);

/**
 * Convert a string query to the corresponding set of case-insensitive regular expressions.
 * - Splies the query into words (respecting "quoted phrases").
 * - Return a regex for each word or quoted phrase.
 * - Unquoted words match partially (starting with a word boundary).
 * - Quoted phrases match fully (starting and ending with a word boundary).
 */
export const toWordRegExps = (query: string): ImmutableArray<RegExp> => toWords(query).map(toWordRegExp);

/** Convert a string to a regular expression matching the start of a word boundary. */
export const toWordRegExp = (word: string) => new RegExp(`\\b${escapeRegExp(normalizeString(word))}`, "i");

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
