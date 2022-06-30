import { sortArray, rankAsc, rankDesc } from "../index.js";

describe("ASC & DESC", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(rankAsc);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types in ascending order", () => {
		// Number.
		expect(rankAsc(130, 125)).toBe(1);
		expect(rankAsc(125, 125)).toBe(0);
		expect(rankAsc(125, 130)).toBe(-1);
		expect(rankAsc(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(rankAsc("abc", 123)).toBe(1);
		expect(rankAsc("abc", "abc")).toBe(0);
		expect(rankAsc("abc", true)).toBe(-1);
		// True.
		expect(rankAsc(true, "abc")).toBe(1);
		expect(rankAsc(true, true)).toBe(0);
		expect(rankAsc(true, false)).toBe(-1);
		expect(rankAsc(true, null)).toBe(-1);
		expect(rankAsc(true, NaN)).toBe(-1);
		// False.
		expect(rankAsc(false, true)).toBe(1);
		expect(rankAsc(false, false)).toBe(0);
		expect(rankAsc(false, null)).toBe(-1);
		expect(rankAsc(false, NaN)).toBe(-1);
		// Null.
		expect(rankAsc(null, false)).toBe(1);
		expect(rankAsc(null, null)).toBe(0);
		expect(rankAsc(null, {})).toBe(-1);
		expect(rankAsc(null, NaN)).toBe(-1);
		expect(rankAsc(null, Symbol())).toBe(-1);
		// Anything else.
		expect(rankAsc(NaN, null)).toBe(1);
		expect(rankAsc(NaN, NaN)).toBe(0);
		expect(rankAsc(NaN, undefined)).toBe(-1);
		expect(rankAsc(Symbol(), null)).toBe(1);
		expect(rankAsc(Symbol(), Symbol())).toBe(0);
		expect(rankAsc(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(rankAsc(undefined, Symbol())).toBe(1);
		expect(rankAsc(undefined, {})).toBe(1);
		expect(rankAsc(undefined, NaN)).toBe(1);
		expect(rankAsc(undefined, undefined)).toBe(0);
	});
	test("Compare values of some types in descending order", () => {
		// Number.
		expect(rankDesc(130, 125)).toBe(-1);
		expect(rankDesc(125, 125)).toBe(0);
		expect(rankDesc(125, 130)).toBe(1);
		expect(rankDesc(123, "abc")).toBe(1);
	});
});
describe("sortArray() & ASC", () => {
	test("sortArray(): Sorts correctly", () => {
		expect(sortArray([], rankAsc)).toEqual([]);
		expect(sortArray([1], rankAsc)).toEqual([1]);
		expect(sortArray([1, 2, 3], rankAsc)).toEqual([1, 2, 3]);
		expect(sortArray([2, 3, 1], rankAsc)).toEqual([1, 2, 3]);
		expect(sortArray([undefined, 1], rankAsc)).toEqual([1, undefined]);
		const unsorted = [1, -1, -Infinity, 0.5, -0.5, Infinity, 100, 0, -100, NaN];
		const sorted = [-Infinity, -100, -1, -0.5, 0, 0.5, 1, 100, Infinity, NaN];
		expect(sortArray(unsorted, rankAsc)).toEqual(sorted);
	});
	test("sortArray(): Strings are sorted correctly", () => {
		const arr = ["0", "00", "1", "01", "001", "g", "z", "gg", "á", "😂", "a", "ê"];
		expect(sortArray(arr, rankAsc)).toEqual(["😂", "0", "00", "001", "01", "1", "a", "á", "ê", "g", "gg", "z"]);
	});
	test("sortArray(): Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		expect(sortArray(arr, rankAsc)).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
});
describe("sortArray() & DESC", () => {
	test("sortArray(): Sorts correctly", () => {
		expect(sortArray([], rankDesc)).toEqual([]);
		expect(sortArray([1], rankDesc)).toEqual([1]);
		expect(sortArray([3, 2, 1], rankDesc)).toEqual([3, 2, 1]);
		expect(sortArray([2, 1, 3], rankDesc)).toEqual([3, 2, 1]);
		expect(sortArray([1, undefined], rankDesc)).toEqual([undefined, 1]);
		const unsorted = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		const sorted = [undefined, {}, null, false, true, "a", "1", "0", 1, 0, -1];
		expect(sortArray(unsorted, rankDesc)).toEqual(sorted);
	});
});
