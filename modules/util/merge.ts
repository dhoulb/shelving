import type { ImmutableArray } from "./array.js";
import type { ImmutableObject, MutableObject } from "./object.js";
import { isArray, withArrayItems } from "./array.js";
import { isObject } from "./object.js";

type MergeRecursor = (left: unknown, right: unknown) => unknown;

// Internal shared by shallow/deep merge.
function _merge(left: unknown, right: unknown, recursor: MergeRecursor) {
	if (left === right) return right;
	if (isArray(right)) return isArray(left) ? mergeArray(left, right) : right;
	if (isObject(right)) return isObject(left) && !isArray(left) ? mergeObject(left, right, recursor) : right;
	return right;
}

/**
 * Exact merge two unknown values.
 * - Always returns `right`.
 */
export const exactMerge: MergeRecursor = (left: unknown, right: unknown): unknown => right;

/**
 * Shallow merge two unknown values.
 *
 * - Two objects: props are merged together (shallowly).
 * - Two arrays: unique items are merged together (shallowly).
 * - Any other value: right value is returned.
 *
 * @returns Merged value.
 * - Will be `left` instance if no properties/items changed.
 * - Will be merged instance otherwise.
 */
export function shallowMerge<L extends ImmutableObject, R extends ImmutableObject>(left: L, right: R): L & R;
export function shallowMerge<L, R>(left: ImmutableArray<L>, right: ImmutableArray<R>): ImmutableArray<L | R>;
export function shallowMerge<R>(left: unknown, right: R): R;
export function shallowMerge(left: unknown, right: unknown): unknown {
	return _merge(left, right, exactMerge);
}

/**
 * Deeply merge two unknown values.
 *
 * - Two objects: props are merged together (deeply).
 * - Two arrays: unique items are merged together (shallowly — arrays have no way to deep merge because array keys are not stable).
 * - Any other value: right value is returned.
 *
 * @returns Merged value.
 * - Will be `left` instance if no properties/items changed.
 * - Will be a new merged instance otherwise.
 */
export function deepMerge<L extends ImmutableObject, R extends ImmutableObject>(left: L, right: R): L & R;
export function deepMerge<L, R>(left: ImmutableArray<L>, right: ImmutableArray<R>): ImmutableArray<L | R>;
export function deepMerge<R>(left: unknown, right: R): R;
export function deepMerge(left: unknown, right: unknown): unknown {
	return _merge(left, right, deepMerge);
}

/**
 * Merge two arrays.
 * - Values are considered unique so values will not appear twice.
 * - Arrays have no concept of `deep merge` because array keys are not stable.
 * - Use an map/object data structure instead for values that need to be deeply mergeable (only use arrays for primitive values).
 *
 * @returns Merged array.
 * - Values that appear in both arrays will not be added twice.
 * - Will be `left` instance if no items were added.
 * - Will be a new merged array otherwise.
 */
export function mergeArray<L, R>(left: ImmutableArray<L>, right: ImmutableArray<R> | ImmutableArray<L>): ImmutableArray<L | R>;
export function mergeArray(left: ImmutableArray, right: ImmutableArray): ImmutableArray {
	if (left === right) return right;
	if (!right.length) return left;
	if (!left.length) return right;
	return withArrayItems(left, ...right);
}

/**
 * Merge two data objects.
 *
 * Properties that exist in `right` will replace or be deeply merged with properties in `left`.
 * - Only works on enumerable own keys (as returned by `Object.keys()`).
 * - Always returns a new object (or the `left` object if no changes were made).
 * - Resulting object is `cleaned`, i.e. properties in `left` or `right` that are `undefined` will be removed from the merged object.
 *
 * @param recursor Function that merges each property of the object.
 * - Defaults to `exactMerge()` to just swap the property for a newer one if it exists.
 * - Use `deepMerge()` as the recursor to merge objects deeply.
 *
 * @return Merged object.
 * - Returned instances will be the same if no changes were made.
 * - Will be `left` instance if no properties changed.
 * - Will be a new merged object otherwise.
 */
export function mergeObject<L extends ImmutableObject, R extends ImmutableObject>(left: L, right: R, recursor?: MergeRecursor): L & R;
export function mergeObject(left: ImmutableObject, right: ImmutableObject, recursor: MergeRecursor = exactMerge): ImmutableObject {
	if (left === right) return right;

	// If `right` has no keys then merge result will always be `left` (because there's nothing to merge).
	const rightEntries = Object.entries(right);
	if (!rightEntries.length) return left;

	const leftKeys = Object.keys(left);
	const merged: MutableObject = { ...left };
	let changed = false;

	for (const [k, r] of rightEntries) {
		if (leftKeys.includes(k)) {
			if (r === undefined) {
				changed = true; // Literal `undefined` means "delete this prop"
			} else {
				const l = left[k];
				const m = recursor(l, r);
				if (m !== l) {
					changed = true;
					merged[k] = m;
				}
			}
		} else {
			changed = true;
			if (r !== undefined) merged[k] = r;
		}
	}

	return changed ? merged : left;
}
