import { describe, expect, test } from "bun:test";
import {
	assertString,
	getWords,
	isStringBetween,
	NBSP,
	NNBSP,
	RequiredError,
	requireSlug,
	requireString,
	sanitizeMultilineText,
	sanitizeText,
	simplifyString,
	splitString,
	THINSP,
	ValueError,
} from "../index.js";

test("assertString()", () => {
	// Assert string.
	expect(() => assertString("abc")).not.toThrow();
	expect(() => assertString(123)).toThrow(RequiredError);
	expect(() => assertString(true)).toThrow(RequiredError);

	// Assert minimum.
	expect(() => assertString("abc", 3)).not.toThrow();
	expect(() => assertString("abc", 5)).toThrow(RequiredError);
	expect(() => assertString("abc", 5)).toThrow(/characters/i);

	// Assert maximum.
	expect(() => assertString("abc", undefined, 3)).not.toThrow();
	expect(() => assertString("abcde", undefined, 3)).toThrow(RequiredError);
	expect(() => assertString("abcde", undefined, 3)).toThrow(/characters/i);

	// Assert both.
	expect(() => assertString("abc", 0, 3)).not.toThrow();
	expect(() => assertString("abcde", 0, 3)).toThrow(RequiredError);
	expect(() => assertString("abcde", 0, 3)).toThrow(/characters/i);
});
test("requireString()", () => {
	// Assert string.
	expect(() => requireString("abc")).not.toThrow();
	expect(() => requireString(123)).not.toThrow();
	expect(() => requireString(new Date())).not.toThrow();
	expect(() => requireString(true as any)).toThrow(RequiredError);

	// Check maximum.
	expect(requireString("abc", 3)).toBe("abc");
	expect(() => requireString("abc", 5)).toThrow(RequiredError);
	expect(() => requireString("abc", 5)).toThrow(/characters/i);

	// Check minimum.
	expect(requireString("abc", 0, 3)).toBe("abc");
	expect(() => requireString("abcde", 0, 3)).toThrow(RequiredError);
	expect(() => requireString("abcde", 0, 3)).toThrow(/characters/i);
});

describe("sanitizeString()", () => {
	test("Normalise runs of whitespace to single ` ` space", () => {
		expect(sanitizeText("aaa\t\t\t   \r\r\rbbb")).toBe("aaa bbb");
	});
	test("Strip control characters", () => {
		expect(sanitizeText("aaa\0bbb")).toBe("aaabbb");
		expect(sanitizeText("a\x01b\x1Fcd\x7Fe\x9Ff")).toBe("abcdef");
		const value1 =
			"ab\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09cd\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fef";
		expect(sanitizeText(value1)).toBe("ab cd ef");
	});
	test("Trim whitespace from the start and end of the string", () => {
		expect(sanitizeText("      aaa      ")).toBe("aaa");
	});
});
describe("sanitizeLines()", () => {
	test("Strip control characters (except newline)", () => {
		expect(sanitizeMultilineText("a\0b\nc\0d\ne\0f")).toBe("ab\ncd\nef");
	});
	test("Normalise weird characters", () => {
		expect(sanitizeMultilineText("AAA\u2029BBB")).toBe("AAA\n\nBBB");
		expect(sanitizeMultilineText("AAA\u2028BBB")).toBe("AAA\nBBB");
		expect(sanitizeMultilineText("AAA\r\nBBB")).toBe("AAA\nBBB");
		expect(sanitizeMultilineText("AAA\rBBB")).toBe("AAA\nBBB");
		expect(sanitizeMultilineText("AAA\vBBB")).toBe("AAA\nBBB");
	});
	test("Normalise runs of whitespace (except indentation) that isn't `\n` newline to ` ` space", () => {
		expect(sanitizeMultilineText("AAA    BBB")).toBe("AAA BBB");
		expect(sanitizeMultilineText("AAA        BBB")).toBe("AAA BBB");
		expect(sanitizeMultilineText(`AAA   \t\t\t${THINSP}${NBSP}${NNBSP}BBB`)).toBe("AAA BBB");
		// Leading indentation is not stripped.
		expect(sanitizeMultilineText("\tAAA    BBB")).toBe("\tAAA BBB");
		expect(sanitizeMultilineText("\tAAA        BBB")).toBe("\tAAA BBB");
		expect(sanitizeMultilineText(`\tAAA   \t\t\t${THINSP}${NBSP}${NNBSP}BBB`)).toBe("\tAAA BBB");
		// Leading indentation is not stripped on second line.
		expect(sanitizeMultilineText("ZZZ\n\tAAA    BBB")).toBe("ZZZ\n\tAAA BBB");
		expect(sanitizeMultilineText("ZZZ\n\tAAA        BBB")).toBe("ZZZ\n\tAAA BBB");
		expect(sanitizeMultilineText(`ZZZ\n\tAAA   \t\t\t${THINSP}${NBSP}${NNBSP}BBB`)).toBe("ZZZ\n\tAAA BBB");
	});
	test("Normalise indentation", () => {
		expect(sanitizeMultilineText("\tAAA")).toBe("\tAAA");
		expect(sanitizeMultilineText("\t\tAAA")).toBe("\t\tAAA");
		// Three (or fewer) spaces normalised to no tabs.
		expect(sanitizeMultilineText(" AAA")).toBe("AAA");
		expect(sanitizeMultilineText("  AAA")).toBe("AAA");
		expect(sanitizeMultilineText("   AAA")).toBe("AAA");
		// Four (or more) spaces normalised to one tab.
		expect(sanitizeMultilineText("    AAA")).toBe("\tAAA");
		expect(sanitizeMultilineText("     AAA")).toBe("\tAAA");
		expect(sanitizeMultilineText("      AAA")).toBe("\tAAA");
		expect(sanitizeMultilineText("       AAA")).toBe("\tAAA");
		// Eight (or more) spaces normalised to two tabs.
		expect(sanitizeMultilineText("        AAA")).toBe("\t\tAAA");
		expect(sanitizeMultilineText("         AAA")).toBe("\t\tAAA");
		expect(sanitizeMultilineText("          AAA")).toBe("\t\tAAA");
		expect(sanitizeMultilineText("           AAA")).toBe("\t\tAAA");
		// Runs of fewer than 4 spaces in indentation are removed.
		expect(sanitizeMultilineText(" \t AAA")).toBe("\tAAA");
		expect(sanitizeMultilineText("  \t  AAA")).toBe("\tAAA");
		expect(sanitizeMultilineText("   \t   AAA")).toBe("\tAAA");
	});
	test("Trim whitespace from the end of each line", () => {
		expect(sanitizeMultilineText("AAA      \nBBB      ")).toBe("AAA\nBBB");
		expect(sanitizeMultilineText("AAA      \n      \nBBB      ")).toBe("AAA\n\nBBB");
	});
	test("Strip excess linebreaks", () => {
		expect(sanitizeMultilineText("\n\n\nAAA\nBBB\nCCC\n\n\n")).toBe("AAA\nBBB\nCCC");
		expect(sanitizeMultilineText("AAA\n\n\nBBB\n\n\nCCC")).toBe("AAA\n\nBBB\n\nCCC");
	});
	test("Convert paragraph separators to double newline", () => {
		expect(sanitizeMultilineText("AAA\fAAA")).toBe("AAA\n\nAAA");
		expect(sanitizeMultilineText("AAA\u2029AAA")).toBe("AAA\n\nAAA");
		expect(sanitizeMultilineText("AAA  \fAAA")).toBe("AAA\n\nAAA");
		expect(sanitizeMultilineText("AAA  \u2029AAA")).toBe("AAA\n\nAAA");
	});
});
describe("simplifyString()", () => {
	test("Works correctly", () => {
		expect(simplifyString("ABC")).toBe("abc");
		expect(simplifyString("    aaa    ")).toBe("aaa");
		expect(simplifyString("aaa    bbb    ccc")).toBe("aaa bbb ccc");
		expect(simplifyString("$^$%@£$ symbols £$%%£@^&@")).toBe("symbols"); // Symbols are removed.
		expect(simplifyString("Fráncé")).toBe("france"); // Marks are normalised.
		expect(simplifyString("𝓔𝓌ⅅⓂ①ﬀ")).toBe("ewdm1ff"); // Characters and ligatures are decomposed.
		expect(simplifyString("Dave's Angles")).toBe("daves angles"); // Apostrophes are sensible.
		expect(simplifyString("abc % def")).toBe("abc def");
	});
});
describe("getSlug()", () => {
	test("Works correctly", () => {
		expect(requireSlug("A Sentence In Sentence Case")).toBe("a-sentence-in-sentence-case");
		expect(requireSlug("SOMETHING VERY loud")).toBe("something-very-loud");
		expect(requireSlug("This: Something to not-be proud of")).toBe("this-something-to-not-be-proud-of");
		expect(requireSlug("under_score")).toBe("under-score");
		expect(requireSlug("Dave's Angles")).toBe("daves-angles");
	});
	test("Hyphens are cleaned up", () => {
		expect(requireSlug("multiple----hyphens")).toBe("multiple-hyphens");
		expect(requireSlug("----trim-hyphens----")).toBe("trim-hyphens");
		expect(requireSlug("trim-hyphens----")).toBe("trim-hyphens");
		expect(requireSlug("----trim-hyphens")).toBe("trim-hyphens");
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

	// Non words.
	expect(getWords("")).toEqual([]);
	expect(getWords(" ")).toEqual([]);
	expect(getWords("    ")).toEqual([]);

	expect(getWords("a-a b-b")).toEqual(["a-a", "b-b"]);
});
test("splitString()", () => {
	// Min and max are the same.
	expect(splitString("a/b", "/", 2, 2)).toEqual(["a", "b"]);
	expect(splitString("a/b/c", "/", 3, 3)).toEqual(["a", "b", "c"]);

	// Max is higher.
	expect(splitString("a/b", "/", 2, 3)).toEqual(["a", "b"]);
	expect(splitString("a/b", "/", 2, Number.POSITIVE_INFINITY)).toEqual(["a", "b"]);
	expect(splitString("a/b/c/d/e/f", "/", 2, Number.POSITIVE_INFINITY)).toEqual(["a", "b", "c", "d", "e", "f"]);

	// Excess segments are joined into last segment..
	expect(splitString("a/b/c", "/", 2, 2)).toEqual(["a", "b/c"]);
	expect(splitString("a/b/c/d/e/f", "/", 4, 4)).toEqual(["a", "b", "c", "d/e/f"]);

	// Excess segments can have empty segments.
	expect(splitString("a/b/c/d//e", "/", 4, 4)).toEqual(["a", "b", "c", "d//e"]);

	// Segments cannot be empty.
	expect(() => splitString("a//c", "/", 10)).toThrow(ValueError);

	// Min segments is not met.
	expect(() => splitString("a/b/c", "/", 4)).toThrow(ValueError);
	expect(() => splitString("a/b/c/d/e/f", "/", 4, 3)).toThrow(ValueError);
});
test("isStringBetween()", () => {
	// Check maximum.
	expect(isStringBetween("abc", 3)).toBe(true);
	expect(isStringBetween("abc", 5)).toBe(false);

	// Check minimum.
	expect(isStringBetween("abc", 0, 3)).toBe(true);
	expect(isStringBetween("abcde", 0, 3)).toBe(false);
});
