import {
	AssertionError,
	addArrayItem,
	addArrayItems,
	assertArrayLength,
	deleteArrayItems,
	filterArray,
	getArrayLength,
	getOptionalNextItem,
	getOptionalPrevItem,
	getUniqueArray,
	isArrayLength,
	isArrayWith,
	isEqual,
	isEqualGreater,
	isEqualLess,
	isGreater,
	isInArray,
	isLess,
	notEqual,
	omitArrayItems,
	shuffleArray,
	toggleArrayItems,
	withArrayItems,
} from "../index.js";

test("toggleItems()", () => {
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
test("withItems()", () => {
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
	expect(filterArray([[1, 2, 3],  [4, 5, 6],  [6, 7, 8]], isArrayWith, 5)).toEqual([[4, 5, 6]]); // prettier-ignore
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
	expect(getOptionalNextItem(arr, 1)).toBe(2);
	expect(getOptionalNextItem(arr, 2)).toBe(3);
	expect(getOptionalNextItem(arr, 3)).toBe(undefined);
	expect(getOptionalNextItem(arr, 4)).toBe(undefined);
});
test("getPrevItem()", () => {
	const arr = [1, 2, 3];
	expect(getOptionalPrevItem(arr, 1)).toBe(undefined);
	expect(getOptionalPrevItem(arr, 2)).toBe(1);
	expect(getOptionalPrevItem(arr, 3)).toBe(2);
	expect(getOptionalPrevItem(arr, 4)).toBe(undefined);
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
test("isArrayLength()", () => {
	// Check maximum.
	expect(isArrayLength([1, 2, 3], 3)).toEqual(true);
	expect(isArrayLength([1, 2, 3], 5)).toEqual(false);

	// Check minimum.
	expect(isArrayLength([1, 2, 3], 0, 3)).toEqual(true);
	expect(isArrayLength([1, 2, 3, 4, 5], 0, 3)).toEqual(false);
});
test("assertArrayLength()", () => {
	// Assert maximum.
	expect(() => assertArrayLength([1, 2, 3], 3)).not.toThrow();
	expect(() => assertArrayLength([1, 2, 3], 5)).toThrow(AssertionError);

	// Assert minimum.
	expect(() => assertArrayLength([1, 2, 3], 0, 3)).not.toThrow();
	expect(() => assertArrayLength([1, 2, 3, 4, 5], 0, 3)).toThrow(AssertionError);
});
test("getArrayLength()", () => {
	// Check maximum.
	expect(getArrayLength([1, 2, 3], 3)).toEqual([1, 2, 3]);
	expect(() => getArrayLength([1, 2, 3], 5)).toThrow(AssertionError);

	// Check minimum.
	expect(getArrayLength([1, 2, 3], 0, 3)).toEqual([1, 2, 3]);
	expect(() => getArrayLength([1, 2, 3, 4, 5], 0, 3)).toThrow(AssertionError);
});
