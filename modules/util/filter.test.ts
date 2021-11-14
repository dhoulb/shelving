import { filter, hasAllWords, hasAnyWord, contains, is, isGreaterThan, isGreaterThanOrEqual, isIn, isLessThan, isLessThanOrEqual, isNot } from "../index.js";

test("filter(): Works correctly with MATCH", () => {
	// Filters correctly.
	expect(filter(["a", "b", "c"], is, "b")).toEqual(["b"]);
	expect(filter(["a", "b", "c"], isNot, "b")).toEqual(["a", "c"]);
	expect(filter(["a", "b", "c"], isIn, ["c", "b"])).toEqual(["b", "c"]);
	expect(filter([1, 2, 3], isGreaterThan, 2)).toEqual([3]);
	expect(filter([1, 2, 3], isGreaterThanOrEqual, 2)).toEqual([2, 3]);
	expect(filter([1, 2, 3], isLessThanOrEqual, 2)).toEqual([1, 2]);
	expect(filter([1, 2, 3], isLessThan, 2)).toEqual([1]);
	expect(filter(["a", "b", "c"], isGreaterThan, "b")).toEqual(["c"]);
	expect(filter(["a", "b", "c"], isGreaterThanOrEqual, "b")).toEqual(["b", "c"]);
	expect(filter(["a", "b", "c"], isLessThanOrEqual, "b")).toEqual(["a", "b"]);
	expect(filter(["a", "b", "c"], isLessThan, "b")).toEqual(["a"]);
	expect(filter([[1, 2, 3],  [4, 5, 6],  [6, 7, 8]], contains, 5)).toEqual([[4, 5, 6]]); // prettier-ignore

	// Returns same instance if no filtering needed.
	const arr = ["a", "b", "c"];
	expect(filter(arr, isIn, ["c", "a", "b"])).toBe(arr);
});
test("filter(): Works correctly with matchAllWords", () => {
	const arr = ["the dog", "the man", "the cat"];
	expect(filter(arr, hasAllWords, "dog")).toEqual(["the dog"]);
	expect(filter(arr, hasAllWords, "do")).toEqual(["the dog"]);
	expect(filter(arr, hasAllWords, "man")).toEqual(["the man"]);
	expect(filter(arr, hasAllWords, "ma")).toEqual(["the man"]);
	expect(filter(arr, hasAllWords, "man cat")).toEqual([]);
	expect(filter(arr, hasAllWords, "ma ca")).toEqual([]);

	// Returs same instance if no filtering needed.
	expect(filter(arr, hasAllWords, "the")).toBe(arr);
	expect(filter(arr, hasAllWords, "th")).toBe(arr);
});
test("filter(): Works correctly with matchAnyWord", () => {
	const arr = ["the dog", "the man", "the cat"];
	expect(filter(arr, hasAnyWord, "dog")).toEqual(["the dog"]);
	expect(filter(arr, hasAnyWord, "do")).toEqual(["the dog"]);
	expect(filter(arr, hasAnyWord, "man")).toEqual(["the man"]);
	expect(filter(arr, hasAnyWord, "ma")).toEqual(["the man"]);
	expect(filter(arr, hasAnyWord, "man cat")).toEqual(["the man", "the cat"]);
	expect(filter(arr, hasAnyWord, "ma ca")).toEqual(["the man", "the cat"]);

	// Returs same instance if no filtering needed.
	expect(filter(arr, hasAnyWord, "the")).toBe(arr);
	expect(filter(arr, hasAnyWord, "th")).toBe(arr);
	expect(filter(arr, hasAnyWord, "dog man cat")).toBe(arr);
	expect(filter(arr, hasAnyWord, "do ma ca")).toBe(arr);
});
