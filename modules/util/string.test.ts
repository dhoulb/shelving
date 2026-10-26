import { describe, expect, test } from "bun:test";
import { RequiredError, ValueError } from "shelving/error";
import { NBSP, NNBSP, THINSP } from "shelving/util/constants";
import {
	assertStringLength,
	getWords,
	isStringBetween,
	requireSlug,
	requireStringLength,
	sanitizeMultilineText,
	sanitizeText,
	sanitizeWord,
	simplifyString,
	splitString,
} from "shelving/util/string";

test("assertStringLength()", () => {
	// Assert string.
	expect(() => assertStringLength("abc")).not.toThrow();
	expect(() => assertStringLength(123)).toThrow(RequiredError);
	expect(() => assertStringLength(true)).toThrow(RequiredError);

	// Assert minimum.
	expect(() => assertStringLength("abc", 3)).not.toThrow();
	expect(() => assertStringLength("abc", 5)).toThrow(RequiredError);
	expect(() => assertStringLength("abc", 5)).toThrow(/characters/i);

	// Assert maximum.
	expect(() => assertStringLength("abc", undefined, 3)).not.toThrow();
	expect(() => assertStringLength("abcde", undefined, 3)).toThrow(RequiredError);
	expect(() => assertStringLength("abcde", undefined, 3)).toThrow(/characters/i);

	// Assert both.
	expect(() => assertStringLength("abc", 0, 3)).not.toThrow();
	expect(() => assertStringLength("abcde", 0, 3)).toThrow(RequiredError);
	expect(() => assertStringLength("abcde", 0, 3)).toThrow(/characters/i);
});
test("requireStringLength()", () => {
	// Assert string.
	expect(requireStringLength("abc")).toBe("abc");
	expect(requireStringLength(123)).toBe("123");
	expect(requireStringLength(true)).toBe("true");
	expect(requireStringLength(false)).toBe("false");
	expect(typeof requireStringLength(new Date())).toBe("string");

	// Assert not string.
	expect(() => requireStringLength(undefined as any)).toThrow(RequiredError);

	// Check maximum.
	expect(requireStringLength("abc", 3)).toBe("abc");
	expect(() => requireStringLength("abc", 5)).toThrow(RequiredError);
	expect(() => requireStringLength("abc", 5)).toThrow(/characters/i);

	// Check minimum.
	expect(requireStringLength("abc", 0, 3)).toBe("abc");
	expect(() => requireStringLength("abcde", 0, 3)).toThrow(RequiredError);
	expect(() => requireStringLength("abcde", 0, 3)).toThrow(/characters/i);
});

describe("sanitizeWord()", () => {
	test("Strip all whitespace entirely", () => {
		expect(sanitizeWord("aaa\t\t\t   \r\r\rbbb")).toBe("aaabbb");
		expect(sanitizeWord("  a b c  ")).toBe("abc");
	});
	test("Strip control characters", () => {
		expect(sanitizeWord("aaa\0bbb")).toBe("aaabbb");
		expect(sanitizeWord("a\x01b\x1Fcd\x7Fe\x9Ff")).toBe("abcdef");
	});
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
	test("NFKD converts styled letters to plain letters", () => {
		expect(simplifyString("ⒸⓒⒶⓩ")).toBe("ccaz"); // Circled.
		expect(simplifyString("⒜⒵🄐🄩")).toBe("azaz"); // Parenthesized.
		expect(simplifyString("🄰🄲🅉")).toBe("acz"); // Squared.
		expect(simplifyString("𝐂𝐨𝐨𝐥")).toBe("cool"); // Bold.
		expect(simplifyString("𝐶𝑜𝑜𝑙")).toBe("cool"); // Italic.
		expect(simplifyString("𝑪𝒐𝒐𝒍")).toBe("cool"); // Bold italic.
		expect(simplifyString("𝒞ℴℴ𝓁")).toBe("cool"); // Script.
		expect(simplifyString("𝓒𝓸𝓸𝓵")).toBe("cool"); // Bold script.
		expect(simplifyString("ℭ𝔬𝔬𝔩")).toBe("cool"); // Fraktur.
		expect(simplifyString("𝕮𝖔𝖔𝖑")).toBe("cool"); // Bold fraktur.
		expect(simplifyString("ℂ𝕠𝕠𝕝")).toBe("cool"); // Double-struck.
		expect(simplifyString("𝖢𝗈𝗈𝗅")).toBe("cool"); // Sans-serif.
		expect(simplifyString("𝘾𝙤𝙤𝙡")).toBe("cool"); // Sans-serif bold italic.
		expect(simplifyString("𝙲𝚘𝚘𝚕")).toBe("cool"); // Monospace.
		expect(simplifyString("Ｃｏｏｌ")).toBe("cool"); // Fullwidth.
		expect(simplifyString("ᶜᵒᵒˡ")).toBe("cool"); // Superscript.
		expect(simplifyString("𝟏𝟚𝟹")).toBe("123"); // Styled digits.
		expect(simplifyString("①⑳⑴⒈")).toBe("12011"); // Circled, parenthesized, and full stop digits.
	});
	test("NFKD converts letterlike symbols to plain letters", () => {
		expect(simplifyString("ℂℊℋℌℍℎℐℑℒℓℕℙℚℛℜℝℤℬℰℱℳℯℴℹ")).toBe("cghhhhiillnpqrrrzbefmeoi");
		expect(simplifyString("™ ℠ № ℡")).toBe("tm sm no tel");
	});
	test("NFKD splits ligatures and removes accents", () => {
		expect(simplifyString("ﬀ ﬁ ﬂ ﬃ ﬄ ﬆ")).toBe("ff fi fl ffi ffl st");
		expect(simplifyString("àáâãäå çèéêë ñòóôõö ùúûü ý")).toBe("aaaaaa ceeee nooooo uuuu y");
		expect(simplifyString("Crème Brûlée")).toBe("creme brulee");
	});
	test("Letterlike characters that NFKD does not convert are converted to plain letters", () => {
		expect(simplifyString("ᴄᴏᴏʟ")).toBe("cool"); // Small capitals.
		expect(simplifyString("ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘꞯʀꜱᴛᴜᴠᴡxʏᴢ")).toBe("abcdefghijklmnopqrstuvwxyz");
		expect(simplifyString("🅒🅞🅞🅛")).toBe("cool"); // Negative circled.
		expect(simplifyString("🅐🅩")).toBe("az");
		expect(simplifyString("🅲🅾🅾🅻")).toBe("cool"); // Negative squared.
		expect(simplifyString("🅰🆉")).toBe("az");
		expect(simplifyString("🇨🇴🇴🇱")).toBe("cool"); // Regional indicators.
		expect(simplifyString("🇦🇿")).toBe("az");
		expect(simplifyString("℮")).toBe("e"); // Estimate symbol.
	});
	test("Letters from other scripts are kept", () => {
		expect(simplifyString("Привет мир")).toBe("привет мир"); // Cyrillic is not converted to Latin.
		expect(simplifyString("Γειά σου")).toBe("γεια σου"); // Greek keeps its letters and loses its accents.
		expect(simplifyString("ℵ ℶ")).toBe("א ב"); // Hebrew letter symbols become Hebrew letters.
		expect(simplifyString("ℼ ℏ")).toBe("π ħ");
		expect(simplifyString("æ œ ß ø ł ð þ")).toBe("æ œ ß ø ł ð þ"); // Letters without a decomposition are kept.
		expect(simplifyString("日本語")).toBe("日本語");
	});
	test("Symbols and emoji are removed", () => {
		expect(simplifyString("© ® ℗ ℅ ℀")).toBe("co ac"); // Symbols with a decomposition keep their letters.
		expect(simplifyString("Hello 😂 World 🎉")).toBe("hello world");
		expect(simplifyString("℘ ℞ ⅋")).toBe("");
	});
	test("Separators are normalised", () => {
		expect(simplifyString("a_b-c\u2014d\u00A0e\tf\ng")).toBe("a b c d e f g");
		expect(simplifyString("  -- a --  ")).toBe("a");
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
	test("Styled titles make useful slugs", () => {
		expect(requireSlug("Ⓒⓞⓞⓛ Ⓣⓘⓣⓛⓔ")).toBe("cool-title");
		expect(requireSlug("𝐶𝑜𝑜𝑙 𝑇𝑖𝑡𝑙𝑒")).toBe("cool-title");
		expect(requireSlug("𝓒𝓸𝓸𝓵 𝓣𝓲𝓽𝓵𝓮")).toBe("cool-title");
		expect(requireSlug("ᴄᴏᴏʟ ᴛɪᴛʟᴇ")).toBe("cool-title");
		expect(requireSlug("🅒🅞🅞🅛 🅣🅘🅣🅛🅔")).toBe("cool-title");
		expect(requireSlug("🅲🅾🅾🅻 🆃🅸🆃🅻🅴")).toBe("cool-title");
		expect(requireSlug("✨ 𝕮𝖔𝖔𝖑 𝕿𝖎𝖙𝖑𝖊 ✨")).toBe("cool-title");
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
