import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import type { Match } from "./match.js";
import type { ImmutableObject } from "./object.js";
import { isArray } from "./array.js";
import { isMap } from "./map.js";
import { isObject, isProp } from "./object.js";
import { compareAscending } from "./sort.js";

/** Is unknown value `left` exactly equal to `right`? */
export function isEqual<T>(left: unknown, right: T): left is T {
	return left === right;
}

/** Is unknown value `left` not exactly equal to `right`? */
export function notEqual<T, N>(left: T | N, right: N): left is T {
	return !isEqual(left, right);
}

/** Is unknown value `left` less than `right`? */
export function isLess(left: unknown, right: unknown) {
	return compareAscending(left, right) < 0;
}

/** Is unknown value `left` less than or equal to `right`? */
export function isEqualLess(left: unknown, right: unknown) {
	return compareAscending(left, right) <= 0;
}

/** Is unknown value `left` greater than `right`? */
export function isGreater(left: unknown, right: unknown) {
	return compareAscending(left, right) > 0;
}

/** Is unknown value `left` greater than or equal to `right`? */
export function isEqualGreater(left: unknown, right: unknown) {
	return compareAscending(left, right) >= 0;
}

// Internal shared by shallow/deep equal.
function _isEqualRecursively(left: unknown, right: unknown, recursor: Match): boolean {
	if (left === right) return true;
	if (isObject(right)) {
		if (isArray(right)) return isArray(left) ? isArrayEqual(left, right, recursor) : false;
		if (isMap(right)) return isMap(left) ? isMapEqual(left, right, recursor) : false;
		return isObject(left) ? isObjectEqual(left, right, recursor) : false;
	}
	return false;
}

/**
 * Are two unknown values shallowly equal?
 * - If the values are both arrays/objects, see if the items/properties are **shallowly** equal with each other.
 */
export function isShallowEqual<T extends unknown>(left: unknown, right: T): left is T {
	return _isEqualRecursively(left, right, isEqual);
}

/** Are two unknown values not shallowly equal? */
export function notShallowEqual<T extends unknown>(left: unknown, right: T): left is T {
	return !isShallowEqual(left, right);
}

/**
 * Are two unknown values deeply equal?
 * - If the values are both arrays/objects, see if the items/properties are **deeply** equal with each other.
 */
export function isDeepEqual<T extends unknown>(left: unknown, right: T): left is T {
	return _isEqualRecursively(left, right, isDeepEqual);
}

/** Are two unknown values not deeply equal? */
export function notDeepEqual<T extends unknown>(left: unknown, right: T): left is T {
	return !isShallowEqual(left, right);
}

/**
 * Are two maps equal (based on their items).
 */
export function isMapEqual<T extends ImmutableMap>(left: ImmutableMap, right: T, recursor: Match = isEqual): left is T {
	if (left === right) return true; // Referentially equal.
	if (left.size !== right.size) return false; // Different lengths aren't equal.
	const leftIterator: Iterator<[unknown, unknown], unknown, undefined> = left.entries();
	for (const r of right) {
		const { done, value: l } = leftIterator.next();
		if (done) return false;
		if (l[0] !== r[0] || !recursor(l[1], r[1])) return false;
	}
	return true;
}

/**
 * Are two arrays equal based on their items?
 *
 * @param recursor Function that checks each item of the array.
 * - Defaults to `isEqual()` to check strict equality of the items.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the items.
 */
export function isArrayEqual<T extends ImmutableArray>(left: ImmutableArray, right: T, recursor: Match = isEqual): left is T {
	if (left === right) return true; // Referentially equal.
	if (left.length !== right.length) return false; // Different lengths aren't equal.
	for (const [k, r] of right.entries()) if (!recursor(left[k], r)) return false;
	return true;
}

/** Is unknown value `left` in array `right`? */
export function isInArray<R>(left: unknown, right: ImmutableArray<R>): left is R {
	return right.includes(left as R);
}

/** Is unknown value `left` not in array `right`? */
export function notInArray(left: unknown, right: ImmutableArray): boolean {
	return !isInArray(left, right);
}

/** Is unknown value `left` an array including `right`? */
export function isArrayWith<T>(left: unknown, right: T): left is ImmutableArray<T> {
	return isArray(left) && left.includes(right);
}

/** Is unknown value `left` not an array or does not include `right`? */
export function notArrayWith(left: unknown, right: unknown): boolean {
	return !notArrayWith(left, right);
}

/**
 * Are two objects equal based on their own props?
 * - `left` must have every property present in `right`
 * - `left` must not have excess properties not present in `right`
 *
 * @param recursor Function that checks each prop of the object.
 * - Defaults to `isEqual()` to check strict equality of the properties.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties.
 */
export function isObjectEqual<T extends ImmutableObject>(left: ImmutableObject, right: T, recursor: Match = isEqual): left is T {
	if (left === right) return true; // Referentially equal.
	const rightEntries = Object.entries(right);
	const leftKeys = Object.keys(left);
	if (rightEntries.length !== leftKeys.length) return false; // Different lengths aren't equal.
	for (const [k, r] of rightEntries) if (!isProp(left, k) || !recursor(left[k], r)) return false;
	return true;
}

/**
 * Are two objects partially equal based on their own props?
 * - `left` must have every property present in `right`
 * - `left` may have have excess properties not present in `right`
 *
 * @param recursor Function that checks each prop of the object.
 * - Defaults to `isEqual()` to check strict equality of the properties.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties.
 */
export function isObjectMatch<L extends ImmutableObject, R extends ImmutableObject>(left: L | R, right: R, recursor: Match = isEqual): left is L & R {
	if (left === right) return true; // Referentially equal.
	const rightEntries = Object.entries(right);
	for (const [k, r] of rightEntries) if (!isProp(left, k) || !recursor(left[k], r)) return false;
	return true;
}

/** Is unknown value `left` an object with every prop from `right`? */
export function isObjectWith(left: unknown, right: ImmutableObject): boolean {
	return isObject(left) && isObjectMatch(left, right);
}

/** Is unknown value `left` not an object or missing one or more props from `right`? */
export function notObjectWith(left: unknown, right: ImmutableObject): boolean {
	return !isObjectWith(left, right);
}
