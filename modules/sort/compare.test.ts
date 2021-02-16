import { COMPARE } from "..";

const { asc } = COMPARE;

describe("compare()", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(asc);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types", () => {
		// Number.
		expect(asc(130, 125)).toBe(1);
		expect(asc(125, 125)).toBe(0);
		expect(asc(125, 130)).toBe(-1);
		expect(asc(123, "abc")).toBe(-1);
		// Date.
		// expect(compare(new Date(2), 1)).toBe(1);
		// expect(compare(new Date(2), new Date(2))).toBe(0);
		// expect(compare(new Date(), "abc")).toBe(-1);
		// String.
		expect(asc("abc", 123)).toBe(1);
		expect(asc("abc", "abc")).toBe(0);
		expect(asc("abc", true)).toBe(-1);
		// True.
		expect(asc(true, "abc")).toBe(1);
		expect(asc(true, true)).toBe(0);
		expect(asc(true, false)).toBe(-1);
		expect(asc(true, null)).toBe(-1);
		expect(asc(true, NaN)).toBe(-1);
		// False.
		expect(asc(false, true)).toBe(1);
		expect(asc(false, false)).toBe(0);
		expect(asc(false, null)).toBe(-1);
		expect(asc(false, NaN)).toBe(-1);
		// Null.
		expect(asc(null, false)).toBe(1);
		expect(asc(null, null)).toBe(0);
		expect(asc(null, {})).toBe(-1);
		expect(asc(null, NaN)).toBe(-1);
		expect(asc(null, Symbol())).toBe(-1);
		// Anything else.
		expect(asc(NaN, null)).toBe(1);
		expect(asc(NaN, NaN)).toBe(0);
		expect(asc(NaN, undefined)).toBe(-1);
		expect(asc(Symbol(), null)).toBe(1);
		expect(asc(Symbol(), Symbol())).toBe(0);
		expect(asc(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(asc(undefined, Symbol())).toBe(1);
		expect(asc(undefined, {})).toBe(1);
		expect(asc(undefined, NaN)).toBe(1);
		expect(asc(undefined, undefined)).toBe(0);
	});
});
