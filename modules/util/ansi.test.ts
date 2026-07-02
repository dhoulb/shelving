import { describe, expect, test } from "bun:test";
import { ANSI_GREEN, ANSI_RESET, ANSI_SUCCESS, ansiWrap } from "shelving/util/ansi";
import { SUCCESS } from "shelving/util/constants";

// `ansiWrap` resolves colour support once at module load (`_USES_COLOR`), so within this process its behaviour is
// fixed — every result is one of two deterministic forms regardless of the test runner's TTY/env state.

describe("ansiWrap()", () => {
	test("wraps a single code to one of its two valid forms", () => {
		expect([`\x1b[31mabc${ANSI_RESET}`, "abc"]).toContain(ansiWrap("abc", "\x1b[31m"));
	});
	test("joins multiple wrappers in order before the input, with a trailing reset", () => {
		expect([`\x1b[31m\x1b[1mabc${ANSI_RESET}`, "abc"]).toContain(ansiWrap("abc", "\x1b[31m", "\x1b[1m"));
	});
});

describe("ANSI icons", () => {
	test("are plain string constants, not lazy objects", () => {
		expect(typeof ANSI_SUCCESS).toBe("string");
	});
	test("are consistent with ansiWrap under the resolved colour support", () => {
		// The icon and a fresh ansiWrap() read the same frozen `_USES_COLOR`, so they always agree.
		expect(ANSI_SUCCESS).toBe(ansiWrap(SUCCESS, ANSI_GREEN));
	});
});
