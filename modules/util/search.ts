import type { ImmutableArray } from "./array.js";
import { matchRegExp } from "./filter.js";
import { toWords, escapeRegExp, normalizeString } from "./string.js";

/**
 * Match an item matching all words in a query.
 *
 * @param item The item to search for the query in.
 * @param query The query string to search for.
 * - Supports `"compound queries"` with quotes.
 */
export function hasAllWords(item: unknown, query: string): boolean {
	const regexps = prepWords(query);
	if (!regexps.length) return false;
	for (const regexp of regexps) if (!matchRegExp(item, regexp)) return false;
	return true;
}

/**
 * Match an item matching all words in a query.
 *
 * @param item The item to search for the query in.
 * @param query The query string to search for.
 * - Supports `"compound queries"` with quotes.
 */
export function hasAnyWord(item: unknown, query: string): boolean {
	const regexps = prepWords(query);
	for (const regexp of regexps) if (matchRegExp(item, regexp)) return true;
	return false;
}

/** Convert a string query to the corresponding set of case-insensitive regular expressions. */
function prepWords(query: string) {
	if (query !== preppedWordsQuery) {
		preppedWordsQuery = query;
		preppedWordsRegExps = toWords(query).map(normalizeString).map(toWordsRegExp);
	}
	return preppedWordsRegExps;
}
let preppedWordsQuery = "";
let preppedWordsRegExps: ImmutableArray<RegExp> = [];
const toWordsRegExp = (word: string) => new RegExp(`\\b${escapeRegExp(word)}`, "i");
