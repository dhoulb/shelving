import { describe, expect, test } from "@jest/globals";
import { compareAscending, compareDescending, sortArray } from "../index.js";

describe("ASC & DESC", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(compareAscending);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types in ascending order", () => {
		// Number.
		expect(compareAscending(130, 125)).toBe(1);
		expect(compareAscending(125, 125)).toBe(0);
		expect(compareAscending(125, 130)).toBe(-1);
		expect(compareAscending(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(compareAscending("abc", 123)).toBe(1);
		expect(compareAscending("abc", "abc")).toBe(0);
		expect(compareAscending("abc", true)).toBe(-1);
		// True.
		expect(compareAscending(true, "abc")).toBe(1);
		expect(compareAscending(true, true)).toBe(0);
		expect(compareAscending(true, false)).toBe(-1);
		expect(compareAscending(true, null)).toBe(-1);
		expect(compareAscending(true, Number.NaN)).toBe(-1);
		// False.
		expect(compareAscending(false, true)).toBe(1);
		expect(compareAscending(false, false)).toBe(0);
		expect(compareAscending(false, null)).toBe(-1);
		expect(compareAscending(false, Number.NaN)).toBe(-1);
		// Null.
		expect(compareAscending(null, false)).toBe(1);
		expect(compareAscending(null, null)).toBe(0);
		expect(compareAscending(null, {})).toBe(-1);
		expect(compareAscending(null, Number.NaN)).toBe(-1);
		expect(compareAscending(null, Symbol())).toBe(-1);
		// Anything else.
		expect(compareAscending(Number.NaN, null)).toBe(1);
		expect(compareAscending(Number.NaN, Number.NaN)).toBe(0);
		expect(compareAscending(Number.NaN, undefined)).toBe(-1);
		expect(compareAscending(Symbol(), null)).toBe(1);
		expect(compareAscending(Symbol(), Symbol())).toBe(0);
		expect(compareAscending(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(compareAscending(undefined, Symbol())).toBe(1);
		expect(compareAscending(undefined, {})).toBe(1);
		expect(compareAscending(undefined, Number.NaN)).toBe(1);
		expect(compareAscending(undefined, undefined)).toBe(0);
	});
	test("Compare values of some types in descending order", () => {
		// Number.
		expect(compareDescending(130, 125)).toBe(-1);
		expect(compareDescending(125, 125)).toBe(0);
		expect(compareDescending(125, 130)).toBe(1);
		expect(compareDescending(123, "abc")).toBe(1);
	});
});
describe("sortItems() & ASC", () => {
	test("sortItems(): Sorts correctly", () => {
		expect(sortArray([], compareAscending)).toEqual([]);
		expect(sortArray([1], compareAscending)).toEqual([1]);
		expect(sortArray([1, 2, 3], compareAscending)).toEqual([1, 2, 3]);
		expect(sortArray([2, 3, 1], compareAscending)).toEqual([1, 2, 3]);
		expect(sortArray([undefined, 1], compareAscending)).toEqual([1, undefined]);
		const unsorted = [1, -1, Number.NEGATIVE_INFINITY, 0.5, -0.5, Number.POSITIVE_INFINITY, 100, 0, -100, Number.NaN];
		const sorted = [Number.NEGATIVE_INFINITY, -100, -1, -0.5, 0, 0.5, 1, 100, Number.POSITIVE_INFINITY, Number.NaN];
		expect(sortArray(unsorted, compareAscending)).toEqual(sorted);
	});
	test("sortItems(): Strings are sorted correctly", () => {
		const arr = ["0", "00", "1", "01", "001", "g", "z", "gg", "á", "😂", "a", "ê"];
		expect(sortArray(arr, compareAscending)).toEqual(["😂", "0", "00", "001", "01", "1", "a", "á", "ê", "g", "gg", "z"]);
	});
	test("sortItems(): Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		expect(sortArray(arr, compareAscending)).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
});
describe("sortItems() & DESC", () => {
	test("sortItems(): Sorts correctly", () => {
		expect(sortArray([], compareDescending)).toEqual([]);
		expect(sortArray([1], compareDescending)).toEqual([1]);
		expect(sortArray([3, 2, 1], compareDescending)).toEqual([3, 2, 1]);
		expect(sortArray([2, 1, 3], compareDescending)).toEqual([3, 2, 1]);
		expect(sortArray([1, undefined], compareDescending)).toEqual([undefined, 1]);
		const unsorted = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		const sorted = [undefined, {}, null, false, true, "a", "1", "0", 1, 0, -1];
		expect(sortArray(unsorted, compareDescending)).toEqual(sorted);
	});
});
