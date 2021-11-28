import { sortArray, ASC, DESC, RankDerived } from "../index.js";

describe("ASC & DESC", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(ASC);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types in ascending order", () => {
		// Number.
		expect(ASC(130, 125)).toBe(1);
		expect(ASC(125, 125)).toBe(0);
		expect(ASC(125, 130)).toBe(-1);
		expect(ASC(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(ASC("abc", 123)).toBe(1);
		expect(ASC("abc", "abc")).toBe(0);
		expect(ASC("abc", true)).toBe(-1);
		// True.
		expect(ASC(true, "abc")).toBe(1);
		expect(ASC(true, true)).toBe(0);
		expect(ASC(true, false)).toBe(-1);
		expect(ASC(true, null)).toBe(-1);
		expect(ASC(true, NaN)).toBe(-1);
		// False.
		expect(ASC(false, true)).toBe(1);
		expect(ASC(false, false)).toBe(0);
		expect(ASC(false, null)).toBe(-1);
		expect(ASC(false, NaN)).toBe(-1);
		// Null.
		expect(ASC(null, false)).toBe(1);
		expect(ASC(null, null)).toBe(0);
		expect(ASC(null, {})).toBe(-1);
		expect(ASC(null, NaN)).toBe(-1);
		expect(ASC(null, Symbol())).toBe(-1);
		// Anything else.
		expect(ASC(NaN, null)).toBe(1);
		expect(ASC(NaN, NaN)).toBe(0);
		expect(ASC(NaN, undefined)).toBe(-1);
		expect(ASC(Symbol(), null)).toBe(1);
		expect(ASC(Symbol(), Symbol())).toBe(0);
		expect(ASC(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(ASC(undefined, Symbol())).toBe(1);
		expect(ASC(undefined, {})).toBe(1);
		expect(ASC(undefined, NaN)).toBe(1);
		expect(ASC(undefined, undefined)).toBe(0);
	});
	test("Compare values of some types in descending order", () => {
		// Number.
		expect(DESC(130, 125)).toBe(-1);
		expect(DESC(125, 125)).toBe(0);
		expect(DESC(125, 130)).toBe(1);
		expect(DESC(123, "abc")).toBe(1);
	});
});
describe("sortArray() & ASC", () => {
	test("sortArray(): Sorts correctly", () => {
		expect(sortArray([], ASC)).toEqual([]);
		expect(sortArray([1], ASC)).toEqual([1]);
		expect(sortArray([1, 2, 3], ASC)).toEqual([1, 2, 3]);
		expect(sortArray([2, 3, 1], ASC)).toEqual([1, 2, 3]);
		expect(sortArray([undefined, 1], ASC)).toEqual([1, undefined]);
		const unsorted = [1, -1, -Infinity, 0.5, -0.5, Infinity, 100, 0, -100, NaN];
		const sorted = [-Infinity, -100, -1, -0.5, 0, 0.5, 1, 100, Infinity, NaN];
		expect(sortArray(unsorted, ASC)).toEqual(sorted);
	});
	test("sortArray(): Strings are sorted correctly", () => {
		const arr = ["0", "00", "1", "01", "001", "g", "z", "gg", "á", "😂", "a", "ê"];
		expect(sortArray(arr, ASC)).toEqual(["😂", "0", "00", "001", "01", "1", "a", "á", "ê", "g", "gg", "z"]);
	});
	describe("RankDerived", () => {
		const subpropRankerASC = new RankDerived<{ prop?: { subprop?: number } }, number | undefined>(v => v?.prop?.subprop, ASC);
		test("RankDerived: Two objects with subprops are sorted correctly", () => {
			const unsorted = [{ prop: { subprop: 0 } }, { prop: { subprop: 1 } }, { prop: { subprop: -1 } }];
			const sorted = [{ prop: { subprop: -1 } }, { prop: { subprop: 0 } }, { prop: { subprop: 1 } }];
			expect(sortArray(unsorted, subpropRankerASC)).toEqual(sorted);
		});
	});
	test("sortArray(): Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		expect(sortArray(arr, ASC)).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
});
describe("sortArray() & DESC", () => {
	test("sortArray(): Sorts correctly", () => {
		expect(sortArray([], DESC)).toEqual([]);
		expect(sortArray([1], DESC)).toEqual([1]);
		expect(sortArray([3, 2, 1], DESC)).toEqual([3, 2, 1]);
		expect(sortArray([2, 1, 3], DESC)).toEqual([3, 2, 1]);
		expect(sortArray([1, undefined], DESC)).toEqual([undefined, 1]);
		const unsorted = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		const sorted = [undefined, {}, null, false, true, "a", "1", "0", 1, 0, -1];
		expect(sortArray(unsorted, DESC)).toEqual(sorted);
	});
	describe("RankDerived", () => {
		const subpropRankerDESC = new RankDerived<{ prop?: { subprop?: number } }, number | undefined>(v => v?.prop?.subprop, DESC);
		test("RankDerived: Two objects with subprops are sorted correctly", () => {
			const unsorted = [{ prop: { subprop: 0 } }, { prop: { subprop: 1 } }, { prop: { subprop: -1 } }];
			const sorted = [{ prop: { subprop: 1 } }, { prop: { subprop: 0 } }, { prop: { subprop: -1 } }];
			expect(sortArray(unsorted, subpropRankerDESC)).toEqual(sorted);
		});
	});
});
