/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Deriver } from "../function";
import { getFirstItem, getSecondItem, ImmutableArray } from "../array";
import { sortDescending } from "../sort";
import { rank, Ranker } from "./rank";

/**
 * Search through an array of items and return an array with just the relevant items (with most relevant first).
 * - Consistent with `sort()`, `filter()`
 *
 * @param items The input array of items, e.g. `[1, 2, 3]`
 * @param ranker Ranking function that takes `item` and `target` and returns the relevance score based on how close item is to target.
 * @param query The query value to match each item in the array against, e.g. `2`
 * @param deriver A deriver function that extracts a specific value from an item (e.g. to compare the `.date` property in two objects).
 *
 * @returns Array with items for which the ranker function returned a number more than zero sorted with highest relevance first.
 */
export function search<T>(items: ImmutableArray<T>): ImmutableArray<T>;
export function search<T>(items: ImmutableArray<T>, ranker: Ranker<T, undefined>): ImmutableArray<T>;
export function search<T>(items: ImmutableArray<T>, ranker: Ranker<T, T>, target: T): ImmutableArray<T>;
export function search<T, TT>(items: ImmutableArray<T>, ranker: Ranker<TT, T>, target: T, deriver?: Deriver<T, TT>): ImmutableArray<TT>;
export function search(items: ImmutableArray, ranker: Ranker<any, any> = rank, target?: unknown, deriver?: Deriver): ImmutableArray {
	const output: [item: unknown, relevance: number][] = [];
	for (const item of items) {
		const relevance = ranker(deriver ? deriver(item) : item, target);
		if (relevance) output.push([item, relevance]);
	}
	return sortDescending(output, getFirstItem).map(getSecondItem);
}
