import { expect, test } from "bun:test";
import {
	RequiredError,
	addArrayItem,
	addArrayItems,
	assertArray,
	deleteArrayItems,
	filterArray,
	getNext,
	getPrev,
	getUniqueArray,
	isArray,
	isArrayWith,
	isEqual,
	isEqualGreater,
	isEqualLess,
	isGreater,
	isInArray,
	isLess,
	notEqual,
	omitArrayItems,
	requireArray,
	shuffleArray,
	toggleArrayItems,
	withArrayItems,
} from "../index.js";

test("toggleArrayItems()", () => {
	const arr = [1, 2, 3];
	expect(toggleArrayItems(arr, 2)).toEqual([1, 3]);
	expect(toggleArrayItems(arr, 2)).not.toBe(arr);
	expect(toggleArrayItems(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(toggleArrayItems(arr, 2)).not.toBe(arr);
	expect(toggleArrayItems(arr, 2, 3)).toEqual([1]);
	expect(toggleArrayItems(arr, 2, 3)).not.toBe(arr);
	expect(toggleArrayItems(arr, 4, 5)).toEqual([1, 2, 3, 4, 5]);
	expect(toggleArrayItems(arr, 4, 5)).not.toBe(arr);
	expect(toggleArrayItems(arr, 1, 4)).toEqual([2, 3, 4]);
	expect(toggleArrayItems(arr, 1, 4)).not.toBe(arr);
});
test("withArrayItems()", () => {
	const arr = [1, 2, 3];
	expect(withArrayItems(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(withArrayItems(arr, 4)).not.toBe(arr);
	expect(withArrayItems(arr, 2)).toBe(arr);
	expect(withArrayItems(arr, 4, 5)).toEqual([1, 2, 3, 4, 5]);
	expect(withArrayItems(arr, 4, 5)).not.toBe(arr);
	expect(withArrayItems(arr, 1, 2)).toBe(arr);
});
test("omitArrayItems()", () => {
	const arr = [1, 2, 3];
	expect(omitArrayItems(arr, 2, 3)).toEqual([1]);
	expect(omitArrayItems(arr, 2, 3)).not.toBe(arr);
	expect(omitArrayItems(arr, 4, 5)).toBe(arr);
});
test("filterArray()", () => {
	// Filters correctly.
	expect(filterArray(["a", "b", "c"], isEqual, "b")).toEqual(["b"]);
	expect(filterArray(["a", "b", "c"], notEqual, "b")).toEqual(["a", "c"]);
	expect(filterArray(["a", "b", "c"], isInArray, ["c", "b"])).toEqual(["b", "c"]);
	expect(filterArray([1, 2, 3], isGreater, 2)).toEqual([3]);
	expect(filterArray([1, 2, 3], isEqualGreater, 2)).toEqual([2, 3]);
	expect(filterArray([1, 2, 3], isEqualLess, 2)).toEqual([1, 2]);
	expect(filterArray([1, 2, 3], isLess, 2)).toEqual([1]);
	expect(filterArray(["a", "b", "c"], isGreater, "b")).toEqual(["c"]);
	expect(filterArray(["a", "b", "c"], isEqualGreater, "b")).toEqual(["b", "c"]);
	expect(filterArray(["a", "b", "c"], isEqualLess, "b")).toEqual(["a", "b"]);
	expect(filterArray(["a", "b", "c"], isLess, "b")).toEqual(["a"]);
	expect(
		filterArray(
			[
				[1, 2, 3],
				[4, 5, 6],
				[6, 7, 8],
			],
			isArrayWith,
			5,
		),
	).toEqual([[4, 5, 6]]);
});
test("addArrayItem()", () => {
	const arr = [1, 2, 3];
	addArrayItem(arr, 4);
	expect(arr).toEqual([1, 2, 3, 4]);
});
test("addArrayItems()", () => {
	const arr = [1, 2, 3];
	addArrayItems(arr, 4, 5);
	expect(arr).toEqual([1, 2, 3, 4, 5]);
});
test("deleteArrayItems()", () => {
	const arr = [1, 2, 3];
	deleteArrayItems(arr, 2, 3);
	expect(arr).toEqual([1]);
});
test("getNextItem()", () => {
	const arr = [1, 2, 3];
	expect(getNext(arr, 1)).toBe(2);
	expect(getNext(arr, 2)).toBe(3);
	expect<number | undefined>(getNext(arr, 3)).toBe(undefined);
	expect<number | undefined>(getNext(arr, 4)).toBe(undefined);
});
test("getPrevItem()", () => {
	const arr = [1, 2, 3];
	expect<number | undefined>(getPrev(arr, 1)).toBe(undefined);
	expect(getPrev(arr, 2)).toBe(1);
	expect(getPrev(arr, 3)).toBe(2);
	expect<number | undefined>(getPrev(arr, 4)).toBe(undefined);
});
test("shuffleArray()", () => {
	const arr = [1, 2, 3];
	expect(shuffleArray(arr)).toContain(1);
	expect(shuffleArray(arr)).toContain(2);
	expect(shuffleArray(arr)).toContain(3);
	expect(shuffleArray(arr)).not.toBe(arr);
});
test("getUniqueArray()", () => {
	expect(getUniqueArray([1, 1, 1])).toEqual([1]);
});
test("isArray()", () => {
	// Check type.
	expect(isArray([1, 2, 3])).toBe(true);
	expect(isArray(false)).toBe(false);
	expect(isArray(123)).toBe(false);
	expect(isArray("a")).toBe(false);

	// Check maximum.
	expect(isArray([1, 2, 3], 3)).toEqual(true);
	expect(isArray([1, 2, 3], 5)).toEqual(false);

	// Check minimum.
	expect(isArray([1, 2, 3], 0, 3)).toEqual(true);
	expect(isArray([1, 2, 3, 4, 5], 0, 3)).toEqual(false);
});
test("assertArray()", () => {
	// Check type.
	expect(() => assertArray([1, 2, 3])).not.toThrow(Array);
	expect(() => assertArray(false as any)).toThrow(RequiredError);

	// Assert maximum.
	expect(() => assertArray([1, 2, 3], 3)).not.toThrow();
	expect(() => assertArray([1, 2, 3], 5)).toThrow(RequiredError);

	// Assert minimum.
	expect(() => assertArray([1, 2, 3], 0, 3)).not.toThrow();
	expect(() => assertArray([1, 2, 3, 4, 5], 0, 3)).toThrow(RequiredError);
});
test("requireArray()", () => {
	// Check type.
	expect(requireArray([1, 2, 3])).toBeInstanceOf(Array);

	// Check maximum.
	expect(requireArray([1, 2, 3], 3)).toEqual([1, 2, 3]);
	expect(() => requireArray([1, 2, 3], 5)).toThrow(RequiredError);

	// Check minimum.
	expect(requireArray([1, 2, 3], 0, 3)).toEqual([1, 2, 3]);
	expect(() => requireArray([1, 2, 3, 4, 5], 0, 3)).toThrow(RequiredError);
});
