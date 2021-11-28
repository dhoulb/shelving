import { isArray } from "./array.js";
import { SAME } from "./constants.js";
import { Data } from "./data.js";
import { isArrayEqual, isDeepEqual } from "./equal.js";
import { DeepPartial, isObject, MutableObject } from "./object.js";

/**
 * Deeply diff two unknown values to produce the transformation needed to transform `left` into `right`, or the `SAME` constant if they are deeply equal.
 *
 * @param left The old value.
 * @param right The new/target value.
 *
 * @return The transformation needed to transform `left` into `right`
 * - If the two values are deeply equal the `SAME` constant is returned.
 * - Unequal scalar values can't be diffed, so `right` is always returned.
 * - If `right` is an array, returns whatever `deepDiffArray()` returns.
 * - If `right` is an object, returns whatever `deepDiffObject()` returns.
 */
export function deepDiff<R extends Data>(left: unknown, right: R): R | DeepPartial<R> | typeof SAME;
export function deepDiff<R extends unknown>(left: unknown, right: R): R | typeof SAME;
export function deepDiff(left: unknown, right: DeepPartial<Data> | unknown): DeepPartial<Data> | unknown | typeof SAME {
	if (left === right) return SAME;
	if (isArray(right)) return isArray(left) ? deepDiffArray(left, right) : right;
	if (isObject(right)) return isObject(left) && !isArray(left) ? deepDiffObject(left, right) : right;
	return right;
}

/**
 * Diff two arrays to produce the transformation needed to transform `left` into `right`
 * DH: Currently arrays don't diff at an item level, they return the entire new array if not deeply equal.
 *
 * @returns The `right` array if it is different to `left`, or the exact `SAME` constant otherwise.
 * - If the two values are deeply equal the `SAME` constant is returned.
 */
export function deepDiffArray<R extends readonly unknown[]>(left: readonly unknown[], right: R): R | typeof SAME {
	if (left === right) return SAME;
	if (isArrayEqual(left, right, isDeepEqual)) return SAME; // Left is exactly equal to right so return `SAME`
	return right; // Right must be different to left so return right.
}

/**
 * Diff two objects to produce the transformation needed to transform `left` into `right`
 * - Only works on enumerable own keys (as returned by `Object.keys()`).
 * - Includes a constructor check — if `left` and `right` have different constructors they will not be merged and `right` will be returned (ensures arrays aren't compared with objects).
 * - Properties that exist in `left` but not `right` (i.e. have been deleted) are represented with `undefined`
 *
 * @return Object containing the missing/updated properties that `left` needs to become `right`.
 * - If the two values are deeply equal the `SAME` constant is returned.
 * - If `left` isn't an object then the result can't be diffed so entire `right` is returned.
 */
export function deepDiffObject<R extends Data>(left: Data, right: R): R | DeepPartial<R> | typeof SAME;
export function deepDiffObject(left: Data, right: Data): Data | typeof SAME {
	if (left === right) return SAME;

	const rightKeys = Object.keys(right);
	const leftKeys = Object.keys(left);

	// If left is empty, entire right is returned.
	if (!leftKeys.length) return rightKeys.length ? right : SAME;

	const diff: MutableObject = {};
	let changed = false;

	for (const k of rightKeys) {
		const d = deepDiff(left[k], right[k]);
		if (d !== SAME) {
			diff[k] = d;
			changed = true;
		}
	}

	// Loop through left to find any deleted docs.
	for (const k of leftKeys) {
		if (!rightKeys.includes(k)) {
			diff[k] = undefined;
			changed = true;
		}
	}

	// If any properties changed.
	return changed ? diff : SAME;
}
