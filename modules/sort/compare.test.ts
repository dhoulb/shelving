import { COMPARE } from "..";

describe("compare()", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(COMPARE.asc);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types", () => {
		// Number.
		expect(COMPARE.asc(130, 125)).toBe(1);
		expect(COMPARE.asc(125, 125)).toBe(0);
		expect(COMPARE.asc(125, 130)).toBe(-1);
		expect(COMPARE.asc(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(COMPARE.asc("abc", 123)).toBe(1);
		expect(COMPARE.asc("abc", "abc")).toBe(0);
		expect(COMPARE.asc("abc", true)).toBe(-1);
		// True.
		expect(COMPARE.asc(true, "abc")).toBe(1);
		expect(COMPARE.asc(true, true)).toBe(0);
		expect(COMPARE.asc(true, false)).toBe(-1);
		expect(COMPARE.asc(true, null)).toBe(-1);
		expect(COMPARE.asc(true, NaN)).toBe(-1);
		// False.
		expect(COMPARE.asc(false, true)).toBe(1);
		expect(COMPARE.asc(false, false)).toBe(0);
		expect(COMPARE.asc(false, null)).toBe(-1);
		expect(COMPARE.asc(false, NaN)).toBe(-1);
		// Null.
		expect(COMPARE.asc(null, false)).toBe(1);
		expect(COMPARE.asc(null, null)).toBe(0);
		expect(COMPARE.asc(null, {})).toBe(-1);
		expect(COMPARE.asc(null, NaN)).toBe(-1);
		expect(COMPARE.asc(null, Symbol())).toBe(-1);
		// Anything else.
		expect(COMPARE.asc(NaN, null)).toBe(1);
		expect(COMPARE.asc(NaN, NaN)).toBe(0);
		expect(COMPARE.asc(NaN, undefined)).toBe(-1);
		expect(COMPARE.asc(Symbol(), null)).toBe(1);
		expect(COMPARE.asc(Symbol(), Symbol())).toBe(0);
		expect(COMPARE.asc(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(COMPARE.asc(undefined, Symbol())).toBe(1);
		expect(COMPARE.asc(undefined, {})).toBe(1);
		expect(COMPARE.asc(undefined, NaN)).toBe(1);
		expect(COMPARE.asc(undefined, undefined)).toBe(0);
	});
});
