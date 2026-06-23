import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import { isArrayEqual, isDeepEqual } from "./equal.js";
import type { DeepPartial, ImmutableObject, MutableObject } from "./object.js";
import { isObject } from "./object.js";

/**
 * The `SAME` symbol indicates sameness.
 * - Returned by the diff functions when two values are deeply equal and no transformation is needed.
 *
 * @see https://shelving.cc/util/diff/SAME
 */
export const SAME: unique symbol = Symbol("shelving/SAME");

/**
 * Deeply diff two unknown values to produce the transformation needed to transform `left` into `right`, or the `SAME` constant if they are deeply equal.
 *
 * @param left The old value.
 * @param right The new/target value.
 *
 * @returns The transformation needed to transform `left` into `right`
 * - If the two values are deeply equal the `SAME` constant is returned.
 * - Unequal scalar values can't be diffed, so `right` is always returned.
 * - If `right` is an array, returns whatever `deepDiffArray()` returns.
 * - If `right` is an object, returns whatever `deepDiffObject()` returns.
 *
 * @example deepDiff({ a: 1 }, { a: 1 }) // SAME
 * @example deepDiff({ a: 1 }, { a: 2 }) // { a: 2 }
 * @see https://shelving.cc/util/diff/deepDiff
 */
export function deepDiff<R extends ImmutableObject>(left: unknown, right: R): R | DeepPartial<R> | typeof SAME;
export function deepDiff<R>(left: unknown, right: R): R | typeof SAME;
export function deepDiff(left: unknown, right: unknown): unknown {
	if (left === right) return SAME;
	if (isArray(right)) return isArray(left) ? deepDiffArray(left, right) : right;
	if (isObject(right)) return isObject(left) && !isArray(left) ? deepDiffObject(left, right) : right;
	return right;
}

/**
 * Diff two arrays to produce the transformation needed to transform `left` into `right`
 * DH: Currently arrays don't diff at an item level, they return the entire new array if not deeply equal.
 *
 * @param left The old array.
 * @param right The new/target array.
 * @returns The `right` array if it is different to `left`, or the exact `SAME` constant otherwise.
 * - If the two values are deeply equal the `SAME` constant is returned.
 * @example deepDiffArray([1, 2], [1, 2]) // SAME
 * @example deepDiffArray([1, 2], [1, 3]) // [1, 3]
 * @see https://shelving.cc/util/diff/deepDiffArray
 */
export function deepDiffArray<R extends ImmutableArray>(left: ImmutableArray, right: R): R | typeof SAME {
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
 * @param left The old object.
 * @param right The new/target object.
 * @returns Object containing the missing/updated properties that `left` needs to become `right`.
 * - If the two values are deeply equal the `SAME` constant is returned.
 * - If `left` isn't an object then the result can't be diffed so entire `right` is returned.
 * @example deepDiffObject({ a: 1 }, { a: 1 }) // SAME
 * @example deepDiffObject({ a: 1, b: 2 }, { a: 1 }) // { b: undefined }
 * @see https://shelving.cc/util/diff/deepDiffObject
 */
export function deepDiffObject<R extends ImmutableObject>(left: ImmutableObject, right: R): R | DeepPartial<R> | typeof SAME;
export function deepDiffObject(left: ImmutableObject, right: ImmutableObject): ImmutableObject | typeof SAME {
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
