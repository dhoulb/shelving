import { toString, toTitle, toSlug, toWords } from "..";

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
