import type { Match } from "./match.js";
import { ImmutableArray } from "./array.js";
import { ImmutableObject, isObject } from "./object.js";
import { ImmutableMap } from "./map.js";

// Internal shared by shallow/deep equal.
function _equal(left: unknown, right: unknown, recursor: Match): boolean {
	if (left === right) return true;
	if (left instanceof Array) return right instanceof Array ? isArrayEqual(left, right, recursor) : false;
	if (left instanceof Map) return right instanceof Map ? isMapEqual(left, right, recursor) : false;
	if (isObject(left)) return isObject(right) && !(right instanceof Array) ? isObjectEqual(left, right, recursor) : false;
	return false;
}

/** Are two unknown values exactly equal? */
export const isExactlyEqual = <L extends unknown>(left: L, right: unknown): right is L => left === right;

/**
 * Are two unknown values shallow equal?
 * - If the values are both arrays/objects, see if the items/properties are **exactly** equal with each other.
 */
export const isShallowEqual = <L extends unknown>(left: L, right: unknown): right is L => _equal(left, right, isExactlyEqual);

/**
 * Are two unknown values deeply equal?
 * - If the values are both arrays/objects, see if the items/properties are **deeply** equal with each other.
 */
export const isDeepEqual = <L extends unknown>(left: L, right: unknown): right is L => _equal(left, right, isDeepEqual);

/**
 * Are two maps equal (based on their items).
 */
export function isMapEqual<L extends ImmutableMap>(left: L, right: ImmutableMap, recursor: Match = isExactlyEqual): right is L {
	if (left === right) return true; // Referentially equal.
	if (left.size !== right.size) return false; // Different lengths aren't equal.
	const rightIterator = right.entries();
	for (const [leftKey, leftValue] of left) {
		const [rightKey, rightValue] = rightIterator.next().value;
		if (leftKey !== rightKey || !recursor(leftValue, rightValue)) return false;
	}
	return true;
}

/**
 * Are two arrays equal (based on their items)?
 *
 * @param recursor Function that checks each property of the object.
 * - Defaults to `isExactlyEqual()` to check strict equality of the items.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the items.
 */
export function isArrayEqual<L extends ImmutableArray>(left: L, right: ImmutableArray, recursor: Match = isExactlyEqual): right is L {
	if (left === right) return true; // Referentially equal.
	if (left.length !== right.length) return false; // Different lengths aren't equal.
	for (const [k, l] of left.entries()) if (!recursor(l, right[k])) return false;
	return true;
}

/**
 * Are two objects equal (based on their properties)?
 * - Only checks enumerable own keys (as returned by `Object.keys()`).
 *
 * @param recursor Function that checks each property of the object.
 * - Defaults to `isExactlyEqual()` to check strict equality of the properties.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties.
 */
export function isObjectEqual<L extends ImmutableObject>(left: L, right: ImmutableObject, recursor: Match = isExactlyEqual): right is L {
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
