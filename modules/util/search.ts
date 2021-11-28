import type { ImmutableArray } from "./array.js";
import { Matchable } from "./filter.js";
import { toWords, escapeRegExp, normalizeString } from "./string.js";

/**
 * Match a string against a regular expression.
 *
 * @param item The item to search for the regexp in.
 * - Item is an array: recurse into each item of the array to look for strings that match.
 * - Item is an object: recurse into each property of the object to look for strings that match.
 * - Item is string: match the string against the regular expression.
 * - Item is anything else: return false (can't be matched).
 *
 * @param regexp The `RegExp` instance to match the
 */
export function MATCHES(item: unknown, regexp: RegExp): boolean {
	return typeof item === "string" && !!item.match(regexp);
}

/**
 * Match an item matching all words in a query.
 *
 * @param item The item to search for the query in.
 * @param query The query string to search for.
 * - Supports `"compound queries"` with quotes.
 */
export function MATCHES_ALL(item: unknown, regexps: ImmutableArray<RegExp>): boolean {
	if (typeof item === "string" && regexps.length) {
		for (const regexp of regexps) if (!item.match(regexp)) return false;
		return true;
	}
	return false;
}

/**
 * Match an item matching all words in a query.
 *
 * @param item The item to search for the query in.
 * @param query The query string to search for.
 * - Supports `"compound queries"` with quotes.
 */
export function MATCHES_ANY(item: unknown, regexps: ImmutableArray<RegExp>): boolean {
	if (typeof item === "string") for (const regexp of regexps) if (MATCHES(item, regexp)) return true;
	return false;
}

/**
 * Convert a string query to the corresponding set of case-insensitive regular expressions.
 * - Splies the query into words (respecting "quoted phrases").
 * - Return a regex for each word or quoted phrase.
 * - Unquoted words match partially (starting with a word boundary).
 * - Quoted phrases match fully (starting and ending with a word boundary).
 */
export const toWordRegExps = (query: string): ImmutableArray<RegExp> => toWords(query).map(normalizeString).map(toWordRegExp);

/** Convert a string word to the corresponding set of case-insensitive regular expressions. */
export const toWordRegExp = (word: string) =>
	word.includes(" ") ? new RegExp(`\\b${escapeRegExp(word)}\\b`, "i") : new RegExp(`\\b${escapeRegExp(word)}`, "i");

/** Matcher that matches any words in a string. */
export class MatchAnyWord implements Matchable<unknown, void> {
	private _regexps: ImmutableArray<RegExp>;
	constructor(words: string) {
		this._regexps = toWordRegExps(words);
	}
	match(value: string): boolean {
		return MATCHES_ANY(value, this._regexps);
	}
}

/** Matcher that matches all words in a string. */
export class MatchAllWords implements Matchable<unknown, void> {
	private _regexps: ImmutableArray<RegExp>;
	constructor(words: string) {
		this._regexps = toWordRegExps(words);
	}
	match(value: string): boolean {
		return MATCHES_ALL(value, this._regexps);
	}
}

/** Matcher that matches an exact phrase. */
export class MatchPhrase implements Matchable<unknown, void> {
	private _regexp: RegExp;
	constructor(phrase: string) {
		this._regexp = toWordRegExp(phrase);
	}
	match(value: string): boolean {
		return MATCHES(value, this._regexp);
	}
}
