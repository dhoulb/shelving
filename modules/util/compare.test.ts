import { COMPARE } from "../index.js";

describe("compare()", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(COMPARE.ASC);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types in ascending order", () => {
		// Number.
		expect(COMPARE.ASC(130, 125)).toBe(1);
		expect(COMPARE.ASC(125, 125)).toBe(0);
		expect(COMPARE.ASC(125, 130)).toBe(-1);
		expect(COMPARE.ASC(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(COMPARE.ASC("abc", 123)).toBe(1);
		expect(COMPARE.ASC("abc", "abc")).toBe(0);
		expect(COMPARE.ASC("abc", true)).toBe(-1);
		// True.
		expect(COMPARE.ASC(true, "abc")).toBe(1);
		expect(COMPARE.ASC(true, true)).toBe(0);
		expect(COMPARE.ASC(true, false)).toBe(-1);
		expect(COMPARE.ASC(true, null)).toBe(-1);
		expect(COMPARE.ASC(true, NaN)).toBe(-1);
		// False.
		expect(COMPARE.ASC(false, true)).toBe(1);
		expect(COMPARE.ASC(false, false)).toBe(0);
		expect(COMPARE.ASC(false, null)).toBe(-1);
		expect(COMPARE.ASC(false, NaN)).toBe(-1);
		// Null.
		expect(COMPARE.ASC(null, false)).toBe(1);
		expect(COMPARE.ASC(null, null)).toBe(0);
		expect(COMPARE.ASC(null, {})).toBe(-1);
		expect(COMPARE.ASC(null, NaN)).toBe(-1);
		expect(COMPARE.ASC(null, Symbol())).toBe(-1);
		// Anything else.
		expect(COMPARE.ASC(NaN, null)).toBe(1);
		expect(COMPARE.ASC(NaN, NaN)).toBe(0);
		expect(COMPARE.ASC(NaN, undefined)).toBe(-1);
		expect(COMPARE.ASC(Symbol(), null)).toBe(1);
		expect(COMPARE.ASC(Symbol(), Symbol())).toBe(0);
		expect(COMPARE.ASC(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(COMPARE.ASC(undefined, Symbol())).toBe(1);
		expect(COMPARE.ASC(undefined, {})).toBe(1);
		expect(COMPARE.ASC(undefined, NaN)).toBe(1);
		expect(COMPARE.ASC(undefined, undefined)).toBe(0);
	});
	test("Compare values of some types in descending order", () => {
		// Number.
		expect(COMPARE.DESC(130, 125)).toBe(-1);
		expect(COMPARE.DESC(125, 125)).toBe(0);
		expect(COMPARE.DESC(125, 130)).toBe(1);
		expect(COMPARE.DESC(123, "abc")).toBe(1);
	});
});
