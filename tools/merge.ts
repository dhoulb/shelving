import { isObject, ReadonlyObject } from "./object";
import { isArray } from "./array";
import { isDeepEqual, isArrayEqual } from "./equal";

/**
 * Deeply merge two unknown values.
 *
 * @param left The old/base value.
 * @param right The (possibly partial) new value to merge in.
 *
 * @returns The new merged value.
 * - If the two values are already deeply equal, `left` will always be returned.
 * - Scalar values can't be merged, so the new value is always returned.
 * - If `right` is an array, returns whatever `deepMergeArray()` returns.
 * - If `right` is an object, returns whatever `deepMergeObject()` returns.
 */
export function deepMerge<L extends ReadonlyObject, R extends ReadonlyObject>(left: L, right: R): L & R;
export function deepMerge<R>(left: unknown, right: R): R;
export function deepMerge(left: unknown, right: unknown): unknown {
	if (left === right) return right;
	if (isArray(right)) return isArray(left) ? deepMergeArray(left, right) : right;
	if (isObject(right)) return isObject(left) && !isArray(left) ? deepMergeObject(left, right) : right;
	return right;
}

/**
 * Merge two arrays together.
 *
 * DH: Currently arrays don't merge at an item level, they return the entire new array if not deeply equal.
 *     Might change this down the line to merge arrays using control symbols like MERGE and DELETE at an item level.
 *     The hard part is making it compatible with how Firestore does it (its delete and merge sentinels treat array items as unique and unordered).
 *     `deepChangeArray()` would need to be updated too so the two remain in sync.
 *
 * @returns The `right` array if the value has changed, or the `left` array if both were deeply equal.
 * - If the two arrays were already deeply equal, the exact `left` instance is returned (which allows optimisations e.g. value doesn't need to be set if it is unchanged).
 */
export function deepMergeArray<R extends readonly unknown[]>(left: readonly unknown[], right: R): R {
	if (left === right) return right;
	if (isArrayEqual(right, left, isDeepEqual)) return left; // Left is exactly equal to right so return `left`
	return right; // Right must be different to left so return right.
}

/**
 * Deeply merge two objects.
 *
 * Properties that exist in `right` will replace or be deeply merged with properties in `left`.
 * - Only works on enumerable own keys (as returned by `Object.keys()`).
 * - Always returns a new object (or the `left` object if no changes were made).
 * - Resulting object is `cleaned`, i.e. properties in `left` or `right` that are `undefined` will be removed from the merged object.
 *
 * @param left The old/base object.
 * @param right The (possibly partial) new value to merge in.
 * @return New object that merges the properties from both, `left` if no properties needed to be merged (i.e. `left` and `right` are deeply equal), or `right` if the result of the merge is deeply equal to `right`.
 */
export function deepMergeObject<L extends ReadonlyObject, R extends ReadonlyObject>(left: L, right: R): L & R;
export function deepMergeObject(left: ReadonlyObject, right: ReadonlyObject): ReadonlyObject {
	if (left === right) return right;

	// If `right` has no keys then merge result will always be `left` (because there's nothing to merge).
	const rightEntries = Object.entries(right);
	if (!rightEntries.length) return left;

	const leftKeys = Object.keys(left);
	const merged = { ...left };
	let changed = false;
	let found = 0; // Number of props in left that are in right too.

	for (const [k, r] of rightEntries) {
		if (leftKeys.includes(k)) {
			found++;
			if (r === undefined) {
				changed = true;
			} else {
				const l = left[k];
				const m = deepMerge(l, r);
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

	// Return the merged props (or the original props if nothing changed.
	if (!changed) return left; // `right` didn't add or change the value of a single prop.
	if (found >= leftKeys.length) return right; // `right` included every prop in `left` (and possibly more).
	return merged; // Left and right were merged.
}
