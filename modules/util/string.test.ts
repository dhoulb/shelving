import { toString, toTitle, toSlug, toWords, normalizeString, sanitizeString, sanitizeLines } from "..";

describe("toString()", () => {
	test("toString(): Correct response for supported things", () => {
		expect(toString("abc")).toBe("abc");
		expect(toString(123)).toBe("123");
		expect(toString(123456789)).toBe("123456789");
		expect(toString(123456.123)).toBe("123456.123");
		expect(toString(123.10000)).toBe("123.1"); // prettier-ignore
	});
	test("toString(): Correct response for non-supported things", () => {
		expect(toString(true)).toBe("");
		expect(toString(false)).toBe("");
		expect(toString(null)).toBe("");
		expect(toString(undefined)).toBe("");
		expect(toString({})).toBe("");
	});
});
describe("toTitle()", () => {
	test("toTitle(): Correct response for supported things", () => {
		expect(toTitle("abc")).toBe("abc");
		expect(toTitle(123)).toBe("123");
		expect(toTitle(123456789)).toBe("123,456,789");
		expect(toTitle(123456.123)).toBe("123,456.123");
		expect(toTitle(123.10000)).toBe("123.1"); // prettier-ignore
		expect(toTitle(true)).toBe("Yes");
		expect(toTitle(false)).toBe("No");
		expect(toTitle(null)).toBe("None");
		expect(toTitle(undefined)).toBe("None");
		expect(toTitle({ title: "abc" })).toBe("abc");
		expect(toTitle({ title: 123 })).toBe("123");
		expect(toTitle({ name: "abc" })).toBe("abc");
		expect(toTitle({ name: 123 })).toBe("123");
	});
	test("toTitle(): Correct response for unsupported things", () => {
		expect(toTitle({})).toBe("Unknown");
		expect(toTitle(Symbol())).toBe("Unknown");
	});
});
describe("sanitizeString()", () => {
	test("sanitizeString(): Removes control characters", () => {
		expect(sanitizeString("abc\0def")).toBe("abcdef");
		expect(sanitizeString("a\x01b\x1Fcd\x7Fe\x9Ff")).toBe("abcdef");
		expect(sanitizeString("a\rb\nc\fd\tef")).toBe("abcdef");
		const value1 =
			"abc\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fdef";
		expect(sanitizeString(value1)).toBe("abcdef");
	});
});
describe("sanitizeLines()", () => {
	test("sanitizeLines(): Ignores tab and newline in multiline mode", () => {
		expect(sanitizeLines("a\0b\tc\0d\ne\0f")).toBe("ab\tcd\nef");
		const value1 =
			"abc\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fdef";
		expect(sanitizeLines(value1)).toBe("abc\t\ndef");
	});
});
describe("normalizeString()", () => {
	test("normalizeString(): Works correctly", () => {
		expect(normalizeString("ABC")).toBe("abc");
		expect(normalizeString("    abc    ")).toBe("abc");
		expect(normalizeString("aaa    bbb    ccc")).toBe("aaa bbb ccc");
		expect(normalizeString("$^$%@£$ symbols £$%%£@^&@")).toBe("symbols"); // Symbols are removed.
		expect(normalizeString("[aaa](bbb):ccc:")).toBe("aaabbbccc"); // Punctuation becomes spaces.
	});
});
describe("toSlug()", () => {
	test("toSlug(): Works correctly", () => {
		expect(toSlug("A Sentence In Sentence Case")).toBe("a-sentence-in-sentence-case");
		expect(toSlug("SOMETHING VERY loud")).toBe("something-very-loud");
		expect(toSlug("This: Something to not-be proud of")).toBe("this-something-to-not-be-proud-of");
		expect(toSlug("under_score")).toBe("under-score");
	});
	test("toSlug(): Hyphens are cleaned up", () => {
		expect(toSlug("multiple----hyphens")).toBe("multiple-hyphens");
		expect(toSlug("----trim-hyphens----")).toBe("trim-hyphens");
		expect(toSlug("trim-hyphens----")).toBe("trim-hyphens");
		expect(toSlug("----trim-hyphens")).toBe("trim-hyphens");
	});
});
test("toWords()", () => {
	// Simple words.
	expect(toWords("aaa bbb")).toEqual(["aaa", "bbb"]);
	expect(toWords("    aaa    bbb    ")).toEqual(["aaa", "bbb"]);

	// Quoted words.
	expect(toWords(`"aaa bbb"`)).toEqual(["aaa bbb"]);
	expect(toWords(`    "aaa    bbb"    `)).toEqual(["aaa    bbb"]);
	expect(toWords(`    "aaa"    "bbb"    `)).toEqual(["aaa", "bbb"]);
	expect(toWords(`aaa bbb "ccc ddd" eee fff`)).toEqual(["aaa", "bbb", "ccc ddd", "eee", "fff"]);
	expect(toWords(`aaa "bbb ccc" ddd "eee fff" ggg`)).toEqual(["aaa", "bbb ccc", "ddd", "eee fff", "ggg"]);
});
