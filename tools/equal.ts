import { ReadonlyObject, isObject } from "./object";
import { isArray } from "./array";

/** Are two unknown values exactly and shallowly equal? */
export const isEqual = <L extends unknown>(left: L, right: unknown): right is L => left === right;

/**
 * Are two unknown values deeply equal?
 * - If the values are both arrays/objects, the items/properties of those arrays/objects are checked for equality too.
 */
export function isDeepEqual<L extends unknown>(left: L, right: unknown, recursor = isDeepEqual): right is L {
	if (left === right) return true;
	if (isArray(left)) return isArray(right) ? isArrayEqual(left, right, recursor) : false;
	if (isObject(left)) return isObject(right) && !isArray(right) ? isObjectEqual(left, right, recursor) : false;
	return false;
}

/**
 * Are two arrays equal (based on their items)?
 *
 * @param recursor Function that checks each property of the object.
 * - Defaults to `isEqual()` to check strict shallow equality of the items.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the items.
 */
export function isArrayEqual<L extends readonly unknown[]>(left: L, right: readonly unknown[], recursor = isEqual): right is L {
	if (left === right) return true; // Referentially equal.
	if (left.length !== right.length) return false; // Different lengths aren't equal.
	for (let i = 0; i < left.length; i++) if (!recursor(left[i], right[i])) return false;
	return true;
}

/**
 * Are two objects equal (based on their properties)?
 * - Only checks enumerable own keys (as returned by `Object.keys()`).
 *
 * @param recursor Function that checks each property of the object.
 * - Defaults to `isEqual()` to check strict shallow equality of the properties.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties.
 */
export function isObjectEqual<L extends ReadonlyObject>(left: L, right: ReadonlyObject, recursor = isEqual): right is L {
	if (left === right) return true; // Referentially equal.

	const leftEntries = Object.entries(left);
	const rightKeys = Object.keys(right);

	if (leftEntries.length !== rightKeys.length) return false; // Different lengths aren't equal.
	if (!leftEntries.length) return true; // Both are equally empty.

	for (const [k, l] of leftEntries) {
		if (!rightKeys.includes(k)) return false;
		const r = right[k];
		if (!recursor(l, r)) return false;
	}

	return true;
}
