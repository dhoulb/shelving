import { sortArray, rankAscending, rankDesc, TransformRanker } from "../index.js";

describe("ASC & DESC", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(rankAscending);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types in ascending order", () => {
		// Number.
		expect(rankAscending(130, 125)).toBe(1);
		expect(rankAscending(125, 125)).toBe(0);
		expect(rankAscending(125, 130)).toBe(-1);
		expect(rankAscending(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(rankAscending("abc", 123)).toBe(1);
		expect(rankAscending("abc", "abc")).toBe(0);
		expect(rankAscending("abc", true)).toBe(-1);
		// True.
		expect(rankAscending(true, "abc")).toBe(1);
		expect(rankAscending(true, true)).toBe(0);
		expect(rankAscending(true, false)).toBe(-1);
		expect(rankAscending(true, null)).toBe(-1);
		expect(rankAscending(true, NaN)).toBe(-1);
		// False.
		expect(rankAscending(false, true)).toBe(1);
		expect(rankAscending(false, false)).toBe(0);
		expect(rankAscending(false, null)).toBe(-1);
		expect(rankAscending(false, NaN)).toBe(-1);
		// Null.
		expect(rankAscending(null, false)).toBe(1);
		expect(rankAscending(null, null)).toBe(0);
		expect(rankAscending(null, {})).toBe(-1);
		expect(rankAscending(null, NaN)).toBe(-1);
		expect(rankAscending(null, Symbol())).toBe(-1);
		// Anything else.
		expect(rankAscending(NaN, null)).toBe(1);
		expect(rankAscending(NaN, NaN)).toBe(0);
		expect(rankAscending(NaN, undefined)).toBe(-1);
		expect(rankAscending(Symbol(), null)).toBe(1);
		expect(rankAscending(Symbol(), Symbol())).toBe(0);
		expect(rankAscending(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(rankAscending(undefined, Symbol())).toBe(1);
		expect(rankAscending(undefined, {})).toBe(1);
		expect(rankAscending(undefined, NaN)).toBe(1);
		expect(rankAscending(undefined, undefined)).toBe(0);
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
		expect(sortArray([], rankAscending)).toEqual([]);
		expect(sortArray([1], rankAscending)).toEqual([1]);
		expect(sortArray([1, 2, 3], rankAscending)).toEqual([1, 2, 3]);
		expect(sortArray([2, 3, 1], rankAscending)).toEqual([1, 2, 3]);
		expect(sortArray([undefined, 1], rankAscending)).toEqual([1, undefined]);
		const unsorted = [1, -1, -Infinity, 0.5, -0.5, Infinity, 100, 0, -100, NaN];
		const sorted = [-Infinity, -100, -1, -0.5, 0, 0.5, 1, 100, Infinity, NaN];
		expect(sortArray(unsorted, rankAscending)).toEqual(sorted);
	});
	test("sortArray(): Strings are sorted correctly", () => {
		const arr = ["0", "00", "1", "01", "001", "g", "z", "gg", "á", "😂", "a", "ê"];
		expect(sortArray(arr, rankAscending)).toEqual(["😂", "0", "00", "001", "01", "1", "a", "á", "ê", "g", "gg", "z"]);
	});
	describe("TransformRanker", () => {
		const subpropRankerASC = new TransformRanker<{ prop?: { subprop?: number } }, number | undefined>(v => v?.prop?.subprop, rankAscending);
		test("TransformRanker: Two objects with subprops are sorted correctly", () => {
			const unsorted = [{ prop: { subprop: 0 } }, { prop: { subprop: 1 } }, { prop: { subprop: -1 } }];
			const sorted = [{ prop: { subprop: -1 } }, { prop: { subprop: 0 } }, { prop: { subprop: 1 } }];
			expect(sortArray(unsorted, subpropRankerASC)).toEqual(sorted);
		});
	});
	test("sortArray(): Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		expect(sortArray(arr, rankAscending)).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
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
	describe("TransformRanker", () => {
		const subpropRankerDESC = new TransformRanker<{ prop?: { subprop?: number } }, number | undefined>(v => v?.prop?.subprop, rankDesc);
		test("TransformRanker: Two objects with subprops are sorted correctly", () => {
			const unsorted = [{ prop: { subprop: 0 } }, { prop: { subprop: 1 } }, { prop: { subprop: -1 } }];
			const sorted = [{ prop: { subprop: 1 } }, { prop: { subprop: 0 } }, { prop: { subprop: -1 } }];
			expect(sortArray(unsorted, subpropRankerDESC)).toEqual(sorted);
		});
	});
});
