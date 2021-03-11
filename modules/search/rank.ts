import { isArray } from "../array";
import { isObject } from "../object";

/**
 * Searcher: similar to a `Matcher` but returns a relevance score (rather than discrete true/false)
 * - Consistent with: `Dispatcher`, `Deriver`, `Comparer`, `Matcher`
 */
export type Ranker<L = unknown, R = unknown> = (item: L, target: R) => number;

/**
 * Rank the relevance of an item to a target.
 * - Target is array or object: call `rank()` recursively for each item/prop and sum the total relevance.
 * - Item is array: call `rank()` recursively for each item/prop and sum the total relevance.
 * - Both strings: +1 if item includes target (i.e. for fulltext searching).
 * - Anything else: +1 if item and target are the same.
 */
export const rank: Ranker = (item, target) => {
	// Target is array: iterate through to calculate total score.
	if (isArray(target) || isObject(target)) {
		let relevance = 0;
		for (const t of Object.values(target)) relevance += rank(item, t);
		return relevance;
	}

	// Item is array: iterate through to calculate total score.
	if (isArray(item) || isObject(item)) {
		let relevance = 0;
		for (const i of Object.values(item)) relevance += rank(i, target);
		return relevance;
	}

	// Both strings: +1 if item includes target.
	if (typeof target === "string" && typeof item === "string") return item.includes(target) ? 1 : 0;

	// Anything else: +1 if item and target are the same.
	return item === target ? 1 : 0;
};
