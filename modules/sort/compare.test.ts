import { compareAscending } from "..";

describe("compare()", () => {
	test("Different types are sorted correctly", () => {
		const arr = ["1", 1, true, 0, "0", "a", undefined, -1, false, null, {}];
		arr.sort(compareAscending);
		expect(arr).toEqual([-1, 0, 1, "0", "1", "a", true, false, null, {}, undefined]);
	});
	test("Compare values of all types", () => {
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
		expect(compareAscending(true, NaN)).toBe(-1);
		// False.
		expect(compareAscending(false, true)).toBe(1);
		expect(compareAscending(false, false)).toBe(0);
		expect(compareAscending(false, null)).toBe(-1);
		expect(compareAscending(false, NaN)).toBe(-1);
		// Null.
		expect(compareAscending(null, false)).toBe(1);
		expect(compareAscending(null, null)).toBe(0);
		expect(compareAscending(null, {})).toBe(-1);
		expect(compareAscending(null, NaN)).toBe(-1);
		expect(compareAscending(null, Symbol())).toBe(-1);
		// Anything else.
		expect(compareAscending(NaN, null)).toBe(1);
		expect(compareAscending(NaN, NaN)).toBe(0);
		expect(compareAscending(NaN, undefined)).toBe(-1);
		expect(compareAscending(Symbol(), null)).toBe(1);
		expect(compareAscending(Symbol(), Symbol())).toBe(0);
		expect(compareAscending(Symbol(), undefined)).toBe(-1);
		// Undefined
		expect(compareAscending(undefined, Symbol())).toBe(1);
		expect(compareAscending(undefined, {})).toBe(1);
		expect(compareAscending(undefined, NaN)).toBe(1);
		expect(compareAscending(undefined, undefined)).toBe(0);
	});
});
