import { NBSP, NNBSP, THINSP, ValueError, assertStringLength, getSlug, getString, getStringLength, getWords, isStringLength, sanitizeLines, sanitizeString, simplifyString, splitString } from "../index.js";

describe("getString()", () => {
	test("Correct returned value", () => {
		expect(getString("aaa")).toBe("aaa");
		expect(getString(123)).toBe("123");
		expect(getString(123456789)).toBe("123,456,789");
		expect(getString(123.10000)).toBe("123.1"); // prettier-ignore
		expect(getString(true)).toBe("Yes");
		expect(getString(false)).toBe("No");
		expect(getString(null)).toBe("None");
		expect(getString(undefined)).toBe("None");
		expect(getString({ title: "aaa" })).toBe("aaa");
		expect(getString({ name: "aaa" })).toBe("aaa");
		expect(getString({})).toBe("Object");
		expect(getString(Symbol())).toBe("Symbol");
	});
});
describe("sanitizeString()", () => {
	test("Normalise runs of whitespace to single ` ` space", () => {
		expect(sanitizeString("aaa\t\t\t   \r\r\rbbb")).toBe("aaa bbb");
	});
	test("Strip control characters", () => {
		expect(sanitizeString("aaa\0bbb")).toBe("aaabbb");
		expect(sanitizeString("a\x01b\x1Fcd\x7Fe\x9Ff")).toBe("abcdef");
		const value1 =
			"ab\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09cd\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fef";
		expect(sanitizeString(value1)).toBe("ab cd ef");
	});
	test("Trim whitespace from the start and end of the string", () => {
		expect(sanitizeString("      aaa      ")).toBe("aaa");
	});
});
describe("sanitizeLines()", () => {
	test("Strip control characters (except newline)", () => {
		expect(sanitizeLines("a\0b\nc\0d\ne\0f")).toBe("ab\ncd\nef");
	});
	test("Normalise weird characters", () => {
		expect(sanitizeLines("AAA\u2029BBB")).toBe("AAA\n\nBBB");
		expect(sanitizeLines("AAA\u2028BBB")).toBe("AAA\nBBB");
		expect(sanitizeLines("AAA\r\nBBB")).toBe("AAA\nBBB");
		expect(sanitizeLines("AAA\rBBB")).toBe("AAA\nBBB");
		expect(sanitizeLines("AAA\vBBB")).toBe("AAA\nBBB");
	});
	test("Normalise runs of whitespace (except indentation) that isn't `\n` newline to ` ` space", () => {
		expect(sanitizeLines(`AAA    BBB`)).toBe("AAA BBB");
		expect(sanitizeLines(`AAA        BBB`)).toBe("AAA BBB");
		expect(sanitizeLines(`AAA   \t\t\t${THINSP}${NBSP}${NNBSP}BBB`)).toBe("AAA BBB");
		// Leading indentation is not stripped.
		expect(sanitizeLines(`\tAAA    BBB`)).toBe("\tAAA BBB");
		expect(sanitizeLines(`\tAAA        BBB`)).toBe("\tAAA BBB");
		expect(sanitizeLines(`\tAAA   \t\t\t${THINSP}${NBSP}${NNBSP}BBB`)).toBe("\tAAA BBB");
	});
	test("Normalise indentation", () => {
		expect(sanitizeLines("\tAAA")).toBe("\tAAA");
		expect(sanitizeLines("\t\tAAA")).toBe("\t\tAAA");
		// Three (or fewer) spaces normalised to no tabs.
		expect(sanitizeLines(" AAA")).toBe("AAA");
		expect(sanitizeLines("  AAA")).toBe("AAA");
		expect(sanitizeLines("   AAA")).toBe("AAA");
		// Four (or more) spaces normalised to one tab.
		expect(sanitizeLines("    AAA")).toBe("\tAAA");
		expect(sanitizeLines("     AAA")).toBe("\tAAA");
		expect(sanitizeLines("      AAA")).toBe("\tAAA");
		expect(sanitizeLines("       AAA")).toBe("\tAAA");
		// Eight (or more) spaces normalised to two tabs.
		expect(sanitizeLines("        AAA")).toBe("\t\tAAA");
		expect(sanitizeLines("         AAA")).toBe("\t\tAAA");
		expect(sanitizeLines("          AAA")).toBe("\t\tAAA");
		expect(sanitizeLines("           AAA")).toBe("\t\tAAA");
		// Runs of fewer than 4 spaces in indentation are removed.
		expect(sanitizeLines(" \t AAA")).toBe("\tAAA");
		expect(sanitizeLines("  \t  AAA")).toBe("\tAAA");
		expect(sanitizeLines("   \t   AAA")).toBe("\tAAA");
	});
	test("Trim whitespace from the end of each line", () => {
		expect(sanitizeLines("AAA      \nBBB      ")).toBe("AAA\nBBB");
		expect(sanitizeLines("AAA      \n      \nBBB      ")).toBe("AAA\n\nBBB");
	});
	test("Strip excess linebreaks", () => {
		expect(sanitizeLines("\n\n\nAAA\nBBB\nCCC\n\n\n")).toBe("AAA\nBBB\nCCC");
		expect(sanitizeLines("AAA\n\n\nBBB\n\n\nCCC")).toBe("AAA\n\nBBB\n\nCCC");
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
		expect(getSlug("A Sentence In Sentence Case")).toBe("a-sentence-in-sentence-case");
		expect(getSlug("SOMETHING VERY loud")).toBe("something-very-loud");
		expect(getSlug("This: Something to not-be proud of")).toBe("this-something-to-not-be-proud-of");
		expect(getSlug("under_score")).toBe("under-score");
		expect(getSlug("Dave's Angles")).toBe("daves-angles");
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
	expect(splitString("a/b", "/", 2, Infinity)).toEqual(["a", "b"]);
	expect(splitString("a/b/c/d/e/f", "/", 2, Infinity)).toEqual(["a", "b", "c", "d", "e", "f"]);

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
test("isStringLength()", () => {
	// Check maximum.
	expect(isStringLength("abc", 3)).toBe(true);
	expect(isStringLength("abc", 5)).toBe(false);

	// Check minimum.
	expect(isStringLength("abc", 0, 3)).toBe(true);
	expect(isStringLength("abcde", 0, 3)).toBe(false);
});
test("assertStringLength()", () => {
	// Assert maximum.
	expect(() => assertStringLength("abc", 3)).not.toThrow();
	expect(() => assertStringLength("abc", 5)).toThrow(ValueError);

	// Assert minimum.
	expect(() => assertStringLength("abc", 0, 3)).not.toThrow();
	expect(() => assertStringLength("abcde", 0, 3)).toThrow(ValueError);
});
test("getStringLength()", () => {
	// Check maximum.
	expect(getStringLength("abc", 3)).toBe("abc");
	expect(() => getStringLength("abc", 5)).toThrow(ValueError);

	// Check minimum.
	expect(getStringLength("abc", 0, 3)).toBe("abc");
	expect(() => getStringLength("abcde", 0, 3)).toThrow(ValueError);
});
