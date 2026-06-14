import { RequiredError } from "../error/RequiredError.js";
import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import type { Match } from "./filter.js";
import type { AnyCaller } from "./function.js";
import type { ImmutableMap } from "./map.js";
import { isMap } from "./map.js";
import type { ImmutableObject } from "./object.js";
import { isObject, isProp } from "./object.js";
import { compareAscending } from "./sort.js";

/**
 * Assert that two values are exactly (referentially) equal, narrowing `left` to the type of `right`.
 *
 * @param left The value to check and narrow.
 * @param right The value `left` must equal.
 * @param caller Function to attribute a thrown error to (defaults to `assertEqual`).
 * @throws {RequiredError} If the values are not equal.
 * @example assertEqual(1, 1); // passes
 * @see https://dhoulb.github.io/shelving/util/equal/assertEqual
 */
export function assertEqual<T>(left: unknown, right: T, caller: AnyCaller = assertEqual): asserts left is T {
	if (left !== right) new RequiredError("Must be equal", { left, right, caller });
}

/**
 * Assert that two values are not equal, narrowing `left` to exclude the type of `right`.
 *
 * @param left The value to check and narrow.
 * @param right The value `left` must not equal.
 * @param caller Function to attribute a thrown error to (defaults to `assertNot`).
 * @throws {RequiredError} If the values are equal.
 * @example assertNot(1, 2); // passes
 * @see https://dhoulb.github.io/shelving/util/equal/assertNot
 */
export function assertNot<T, N>(left: T | N, right: N, caller: AnyCaller = assertNot): asserts left is T {
	if (left === right) new RequiredError("Must not be equal", { left, right, caller });
}

/**
 * Is unknown value `left` exactly (referentially) equal to `right`?
 *
 * @param left The value to check and narrow.
 * @param right The value to compare against.
 * @returns `true` if the values are strictly equal.
 * @example isEqual(1, 1) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isEqual
 */
export function isEqual<T>(left: unknown, right: T): left is T {
	return left === right;
}

/**
 * Is unknown value `left` not exactly (referentially) equal to `right`?
 *
 * @param left The value to check and narrow.
 * @param right The value to compare against.
 * @returns `true` if the values are not strictly equal.
 * @example notEqual(1, 2) // true
 * @see https://dhoulb.github.io/shelving/util/equal/notEqual
 */
export function notEqual<T, N>(left: T | N, right: N): left is T {
	return left !== right;
}

/**
 * Is unknown value `left` less than `right` (using `compareAscending`)?
 *
 * @param left The value to compare.
 * @param right The value to compare against.
 * @returns `true` if `left` sorts before `right`.
 * @example isLess(1, 2) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isLess
 */
export function isLess(left: unknown, right: unknown) {
	return compareAscending(left, right) < 0;
}

/**
 * Is unknown value `left` less than or equal to `right` (using `compareAscending`)?
 *
 * @param left The value to compare.
 * @param right The value to compare against.
 * @returns `true` if `left` sorts before or equal to `right`.
 * @example isEqualLess(2, 2) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isEqualLess
 */
export function isEqualLess(left: unknown, right: unknown) {
	return compareAscending(left, right) <= 0;
}

/**
 * Is unknown value `left` greater than `right` (using `compareAscending`)?
 *
 * @param left The value to compare.
 * @param right The value to compare against.
 * @returns `true` if `left` sorts after `right`.
 * @example isGreater(2, 1) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isGreater
 */
export function isGreater(left: unknown, right: unknown) {
	return compareAscending(left, right) > 0;
}

/**
 * Is unknown value `left` greater than or equal to `right` (using `compareAscending`)?
 *
 * @param left The value to compare.
 * @param right The value to compare against.
 * @returns `true` if `left` sorts after or equal to `right`.
 * @example isEqualGreater(2, 2) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isEqualGreater
 */
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
 *
 * @param left The value to check and narrow.
 * @param right The value to compare against.
 * @returns `true` if the values are shallowly equal.
 * @example isShallowEqual({ a: 1 }, { a: 1 }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isShallowEqual
 */
export function isShallowEqual<T>(left: unknown, right: T): left is T {
	return _isEqualRecursively(left, right, isEqual);
}

/**
 * Are two unknown values not shallowly equal?
 *
 * @param left The value to check and narrow.
 * @param right The value to compare against.
 * @returns `true` if the values are not shallowly equal.
 * @example notShallowEqual({ a: 1 }, { a: 2 }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/notShallowEqual
 */
export function notShallowEqual<T>(left: unknown, right: T): left is T {
	return !isShallowEqual(left, right);
}

/**
 * Are two unknown values deeply equal?
 * - If the values are both arrays/objects, see if the items/properties are **deeply** equal with each other.
 *
 * @param left The value to check and narrow.
 * @param right The value to compare against.
 * @returns `true` if the values are deeply equal.
 * @example isDeepEqual({ a: { b: 1 } }, { a: { b: 1 } }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isDeepEqual
 */
export function isDeepEqual<T>(left: unknown, right: T): left is T {
	return _isEqualRecursively(left, right, isDeepEqual);
}

/**
 * Are two unknown values not deeply equal?
 *
 * @param left The value to check and narrow.
 * @param right The value to compare against.
 * @returns `true` if the values are not deeply equal.
 * @example notDeepEqual({ a: { b: 1 } }, { a: { b: 2 } }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/notDeepEqual
 */
export function notDeepEqual<T>(left: unknown, right: T): left is T {
	return !isShallowEqual(left, right);
}

/**
 * Are two maps equal based on their items?
 *
 * @param left The map to check and narrow.
 * @param right The map to compare against.
 * @param recursor Function that checks each value of the map (defaults to `isEqual` for strict equality; pass `isDeepEqual` for deep equality).
 * @returns `true` if both maps have the same keys and matching values.
 * @example isMapEqual(new Map([["a", 1]]), new Map([["a", 1]])) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isMapEqual
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
 * @param left The array to check and narrow.
 * @param right The array to compare against.
 * @param recursor Function that checks each item of the array.
 * - Defaults to `isEqual()` to check strict equality of the items.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the items.
 * @returns `true` if both arrays have the same length and matching items.
 * @example isArrayEqual([1, 2], [1, 2]) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isArrayEqual
 */
export function isArrayEqual<T extends ImmutableArray>(left: ImmutableArray, right: T, recursor: Match = isEqual): left is T {
	if (left === right) return true; // Referentially equal.
	if (left.length !== right.length) return false; // Different lengths aren't equal.
	for (const [k, r] of right.entries()) if (!recursor(left[k], r)) return false;
	return true;
}

/**
 * Is unknown value `left` in array `right`?
 *
 * @param left The value to look for and narrow.
 * @param right The array to search within.
 * @returns `true` if `left` is an item of `right`.
 * @example isInArray(2, [1, 2, 3]) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isInArray
 */
export function isInArray<R>(left: unknown, right: ImmutableArray<R>): left is R {
	return right.includes(left as R);
}

/**
 * Is unknown value `left` not in array `right`?
 *
 * @param left The value to look for.
 * @param right The array to search within.
 * @returns `true` if `left` is not an item of `right`.
 * @example notInArray(9, [1, 2, 3]) // true
 * @see https://dhoulb.github.io/shelving/util/equal/notInArray
 */
export function notInArray(left: unknown, right: ImmutableArray): boolean {
	return !isInArray(left, right);
}

/**
 * Is unknown value `left` an array that includes `right`?
 *
 * @param left The value to check and narrow.
 * @param right The item the array must include.
 * @returns `true` if `left` is an array containing `right`.
 * @example isArrayWith([1, 2, 3], 2) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isArrayWith
 */
export function isArrayWith<T>(left: unknown, right: T): left is ImmutableArray<T> {
	return isArray(left) && left.includes(right);
}

/**
 * Is unknown value `left` not an array, or an array that does not include `right`?
 *
 * @param left The value to check.
 * @param right The item the array must include.
 * @returns `true` if `left` is not an array or does not include `right`.
 * @example notArrayWith([1, 2, 3], 9) // true
 * @see https://dhoulb.github.io/shelving/util/equal/notArrayWith
 */
export function notArrayWith(left: unknown, right: unknown): boolean {
	return !isArrayWith(left, right);
}

/**
 * Are two objects equal based on their own props?
 * - `left` must have every property present in `right`
 * - `left` must not have excess properties not present in `right`
 *
 * @param left The object to check and narrow.
 * @param right The object to compare against.
 * @param recursor Function that checks each prop of the object.
 * - Defaults to `isEqual()` to check strict equality of the properties.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties.
 * @returns `true` if both objects have exactly the same own props and matching values.
 * @example isObjectEqual({ a: 1 }, { a: 1 }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isObjectEqual
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
 * @param left The object to check and narrow.
 * @param right The object whose props `left` must contain.
 * @param recursor Function that checks each prop of the object.
 * - Defaults to `isEqual()` to check strict equality of the properties.
 * - Use `isDeepEqual()` as the recursor to check to check deep equality of the properties.
 * @returns `true` if `left` contains every prop of `right` with matching values.
 * @example isObjectMatch({ a: 1, b: 2 }, { a: 1 }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isObjectMatch
 */
export function isObjectMatch<L extends ImmutableObject, R extends ImmutableObject>(
	left: L | R,
	right: R,
	recursor: Match = isEqual,
): left is L & R {
	if (left === right) return true; // Referentially equal.
	const rightEntries = Object.entries(right);
	for (const [k, r] of rightEntries) if (!isProp(left, k) || !recursor(left[k], r)) return false;
	return true;
}

/**
 * Is unknown value `left` an object with every prop from `right`?
 *
 * @param left The value to check.
 * @param right The object whose props `left` must contain.
 * @returns `true` if `left` is an object containing every prop of `right`.
 * @example isObjectWith({ a: 1, b: 2 }, { a: 1 }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/isObjectWith
 */
export function isObjectWith(left: unknown, right: ImmutableObject): boolean {
	return isObject(left) && isObjectMatch(left, right);
}

/**
 * Is unknown value `left` not an object or missing one or more props from `right`?
 *
 * @param left The value to check.
 * @param right The object whose props `left` must contain.
 * @returns `true` if `left` is not an object or is missing one or more props of `right`.
 * @example notObjectWith({ a: 1 }, { b: 2 }) // true
 * @see https://dhoulb.github.io/shelving/util/equal/notObjectWith
 */
export function notObjectWith(left: unknown, right: ImmutableObject): boolean {
	return !isObjectWith(left, right);
}
