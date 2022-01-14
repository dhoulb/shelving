import { filterArray, isArrayWith, isEqual, isGreater, isEqualGreater, isInArray, isLess, isEqualLess, notEqual } from "../index.js";

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
