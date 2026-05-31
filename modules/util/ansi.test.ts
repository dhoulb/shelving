import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ANSI_RESET, ANSI_SUCCESS, ansiWrap } from "../index.js";

// Save and restore `NO_COLOR` around each test so we can flip it at runtime.
let _previous: string | undefined;
beforeEach(() => {
	_previous = process.env.NO_COLOR;
});
afterEach(() => {
	if (_previous === undefined) delete process.env.NO_COLOR;
	else process.env.NO_COLOR = _previous;
});

describe("ansiWrap()", () => {
	test("wraps input in codes and reset when NO_COLOR is unset", () => {
		delete process.env.NO_COLOR;
		expect(ansiWrap("abc", "\x1b[31m")).toBe(`\x1b[31mabc${ANSI_RESET}`);
	});
	test("returns input unchanged when NO_COLOR is truthy", () => {
		process.env.NO_COLOR = "1";
		expect(ansiWrap("abc", "\x1b[31m")).toBe("abc");
	});
	test("reads NO_COLOR live on each call", () => {
		// Same call, different environment, different result — proves there is no frozen capture.
		process.env.NO_COLOR = "0";
		const coloured = ansiWrap("abc", "\x1b[31m");
		process.env.NO_COLOR = "true";
		const plain = ansiWrap("abc", "\x1b[31m");
		expect(coloured).toBe(`\x1b[31mabc${ANSI_RESET}`);
		expect(plain).toBe("abc");
	});
});

describe("ANSI icons", () => {
	test("colour seamlessly inside template literals", () => {
		delete process.env.NO_COLOR;
		expect(`${ANSI_SUCCESS}`).toBe(`\x1b[32m✓${ANSI_RESET}`);
	});
	test("re-evaluate against the live NO_COLOR (late-populated env)", () => {
		// Simulates a runtime that populates env vars after module-load: the icon must reflect the new value.
		delete process.env.NO_COLOR;
		expect(`${ANSI_SUCCESS}`).toBe(`\x1b[32m✓${ANSI_RESET}`);
		process.env.NO_COLOR = "yes";
		expect(`${ANSI_SUCCESS}`).toBe("✓");
	});
});
