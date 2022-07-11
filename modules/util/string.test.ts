import { getString, getTitle, getSlug, getWords, normalizeString, sanitizeString, sanitizeLines } from "../index.js";

describe("getString()", () => {
	test("getString(): Correct response for supported things", () => {
		expect(getString("abc")).toBe("abc");
		expect(getString(123)).toBe("123");
		expect(getString(123456789)).toBe("123456789");
		expect(getString(123456.123)).toBe("123456.123");
		expect(getString(123.10000)).toBe("123.1"); // prettier-ignore
	});
	test("getString(): Correct response for non-supported things", () => {
		expect(getString(true)).toBe("true");
		expect(getString(false)).toBe("false");
		expect(getString(null)).toBe("null");
		expect(getString(undefined)).toBe("undefined");
	});
});
describe("getTitle()", () => {
	test("getTitle(): Correct response for supported things", () => {
		expect(getTitle("abc")).toBe("abc");
		expect(getTitle(123)).toBe("123");
		expect(getTitle(123456789)).toBe("123,456,789");
		expect(getTitle(123456.123)).toBe("123,456.123");
		expect(getTitle(123.10000)).toBe("123.1"); // prettier-ignore
		expect(getTitle(true)).toBe("Yes");
		expect(getTitle(false)).toBe("No");
		expect(getTitle(null)).toBe("None");
		expect(getTitle(undefined)).toBe("None");
		expect(getTitle({ title: "abc" })).toBe("abc");
		expect(getTitle({ title: 123 })).toBe("123");
		expect(getTitle({ name: "abc" })).toBe("abc");
		expect(getTitle({ name: 123 })).toBe("123");
	});
	test("getTitle(): Correct response for unsupported things", () => {
		expect(getTitle({})).toBe("Unknown");
		expect(getTitle(Symbol())).toBe("Unknown");
	});
});
describe("sanitizeString()", () => {
	test("Removes control characters", () => {
		expect(sanitizeString("abc\0def")).toBe("abcdef");
		expect(sanitizeString("a\x01b\x1Fcd\x7Fe\x9Ff")).toBe("abcdef");
		const value1 =
			"ab\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09cd\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fef";
		expect(sanitizeString(value1)).toBe("ab cd ef");
	});
	test("Trim the start and end of the string", () => {
		expect(sanitizeString("      aaa      ")).toBe("aaa");
	});
});
describe("sanitizeLines()", () => {
	test("Removes control characters except tab and newline", () => {
		expect(sanitizeLines("a\0b\tc\0d\ne\0f")).toBe("ab\tcd\nef");
		const value1 =
			"ab\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09cd\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fef";
	});
	test("Trim the end of the lines", () => {
		expect(sanitizeLines("      aaa      \n      bbb      ")).toBe("      aaa\n      bbb");
		expect(sanitizeLines("      LINE1      \n      \n      LINE2      ")).toBe("      LINE1\n\n      LINE2");
	});
});
describe("normalizeString()", () => {
	test("Works correctly", () => {
		expect(normalizeString("ABC")).toBe("abc");
		expect(normalizeString("    abc    ")).toBe("abc");
		expect(normalizeString("aaa    bbb    ccc")).toBe("aaa bbb ccc");
		expect(normalizeString("$^$%@£$ symbols £$%%£@^&@")).toBe("symbols"); // Symbols are removed.
		expect(normalizeString("[aaa](bbb):ccc:")).toBe("aaabbbccc"); // Punctuation is removed.
	});
});
describe("toSlug()", () => {
	test("Works correctly", () => {
		expect(getSlug("A Sentence In Sentence Case")).toBe("a-sentence-in-sentence-case");
		expect(getSlug("SOMETHING VERY loud")).toBe("something-very-loud");
		expect(getSlug("This: Something to not-be proud of")).toBe("this-something-to-not-be-proud-of");
		expect(getSlug("under_score")).toBe("under-score");
	});
	test("Hyphens are cleaned up", () => {
		expect(getSlug("multiple----hyphens")).toBe("multiple-hyphens");
		expect(getSlug("----trim-hyphens----")).toBe("trim-hyphens");
		expect(getSlug("trim-hyphens----")).toBe("trim-hyphens");
		expect(getSlug("----trim-hyphens")).toBe("trim-hyphens");
	});
});
test("getWords()", () => {
	// Simple words.
	expect(getWords("aaa bbb")).toEqual(["aaa", "bbb"]);
	expect(getWords("    aaa    bbb    ")).toEqual(["aaa", "bbb"]);

	// Quoted words.
	expect(getWords(`"aaa bbb"`)).toEqual(["aaa bbb"]);
	expect(getWords(`    "aaa    bbb"    `)).toEqual(["aaa    bbb"]);
	expect(getWords(`    "aaa"    "bbb"    `)).toEqual(["aaa", "bbb"]);
	expect(getWords(`aaa bbb "ccc ddd" eee fff`)).toEqual(["aaa", "bbb", "ccc ddd", "eee", "fff"]);
	expect(getWords(`aaa "bbb ccc" ddd "eee fff" ggg`)).toEqual(["aaa", "bbb ccc", "ddd", "eee fff", "ggg"]);
});
