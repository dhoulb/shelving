import { toWords, escapeRegExp } from "../string";
import { ImmutableArray } from "../array";
import { Matcher } from "../filter";
import { isObject } from "../object";

/**
 * Filter matcher that supports fulltext searching.
 *
 * @param item The item to search for the query in.
 * - Item is an array: recurse into each item  of the object.
 * - Item is an object: recurse into each property of the object.
 * - Item is string: match against the set of regular expressions.
 * - Item is anything else: return false (can't be matched).
 * @param regexps The set of regular expressions to match against the item.
 */
const searchRegExps: Matcher<unknown, ImmutableArray<RegExp>> = (item, regexps) => {
	for (const regexp of regexps) if (!searchRegExp(item, regexp)) return false;
	return true;
};
const searchRegExp: Matcher<unknown, RegExp> = (item, regexp) => {
	// Item is array or object: recurse into it and return +1 if any item matches the regexp.
	// e.g. `rank({ title: "Big Dog", description: "etc" }, "dog")`  will return `1`
	if (isObject(item)) {
		for (const i of Object.values(item)) if (searchRegExp(i, regexp)) return true;
		return false;
	}
	// See if item is a string and matches the regexp.
	return typeof item === "string" && !!item.match(regexp);
};

/** Convert a string query to the corresponding set of case-insensitive regular expressions. */
const prepWords = (query: string) => {
	if (query !== cachedWordsQuery) {
		cachedWordsQuery = query;
		cachedWordsRegExps = toWords(query).map(toWordsRegExp);
	}
	return cachedWordsRegExps;
};
let cachedWordsQuery = "";
let cachedWordsRegExps: ImmutableArray<RegExp> = [];
const toWordsRegExp = (word: string) => new RegExp(`\\b${escapeRegExp(word)}`, "i");

/** Filter matchers that support fulltext searching. */
export const SEARCH: {
	WORDS: Matcher<unknown, string>;
} = {
	/**
	 * Fulltext search filter matcher that matches the start of every word in a query.
	 * - Matches if every word in `query` matches the start of a word in `item`
	 * - Case insensitive.
	 */
	WORDS: (item, query) => searchRegExps(item, prepWords(query)),
};
