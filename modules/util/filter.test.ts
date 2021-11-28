import { filterArray, CONTAINS, IS, GT, GTE, IN, LT, LTE, NOT } from "../index.js";

test("filterArray()", () => {
	// Filters correctly.
	expect(filterArray(["a", "b", "c"], IS, "b")).toEqual(["b"]);
	expect(filterArray(["a", "b", "c"], NOT, "b")).toEqual(["a", "c"]);
	expect(filterArray(["a", "b", "c"], IN, ["c", "b"])).toEqual(["b", "c"]);
	expect(filterArray([1, 2, 3], GT, 2)).toEqual([3]);
	expect(filterArray([1, 2, 3], GTE, 2)).toEqual([2, 3]);
	expect(filterArray([1, 2, 3], LTE, 2)).toEqual([1, 2]);
	expect(filterArray([1, 2, 3], LT, 2)).toEqual([1]);
	expect(filterArray(["a", "b", "c"], GT, "b")).toEqual(["c"]);
	expect(filterArray(["a", "b", "c"], GTE, "b")).toEqual(["b", "c"]);
	expect(filterArray(["a", "b", "c"], LTE, "b")).toEqual(["a", "b"]);
	expect(filterArray(["a", "b", "c"], LT, "b")).toEqual(["a"]);
	expect(filterArray([[1, 2, 3],  [4, 5, 6],  [6, 7, 8]], CONTAINS, 5)).toEqual([[4, 5, 6]]); // prettier-ignore
});
