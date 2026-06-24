import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { ANSI_RESET, ANSI_SUCCESS, ansiWrap } from "../index.js";

// Save and restore the colour-support environment around each test so we can flip it at runtime.
let _noColor: string | undefined;
let _forceColor: string | undefined;
let _term: string | undefined;
let _isTTY: boolean | undefined;
beforeEach(() => {
	_noColor = process.env.NO_COLOR;
	_forceColor = process.env.FORCE_COLOR;
	_term = process.env.TERM;
	_isTTY = process.stdout?.isTTY;
});
afterEach(() => {
	_restore("NO_COLOR", _noColor);
	_restore("FORCE_COLOR", _forceColor);
	_restore("TERM", _term);
	if (process.stdout) process.stdout.isTTY = _isTTY as boolean;
});
function _restore(name: string, value: string | undefined): void {
	if (value === undefined) delete process.env[name];
	else process.env[name] = value;
}

describe("ansiWrap()", () => {
	test("wraps input in codes and reset when FORCE_COLOR opts in", () => {
		delete process.env.NO_COLOR;
		process.env.FORCE_COLOR = "1";
		expect(ansiWrap("abc", "\x1b[31m")).toBe(`\x1b[31mabc${ANSI_RESET}`);
	});
	test("returns input unchanged when NO_COLOR is set", () => {
		delete process.env.FORCE_COLOR;
		process.env.NO_COLOR = "1";
		expect(ansiWrap("abc", "\x1b[31m")).toBe("abc");
	});
	test("FORCE_COLOR overrides NO_COLOR", () => {
		process.env.NO_COLOR = "1";
		process.env.FORCE_COLOR = "1";
		expect(ansiWrap("abc", "\x1b[31m")).toBe(`\x1b[31mabc${ANSI_RESET}`);
	});
	test("FORCE_COLOR=0 forces colour off even on a TTY", () => {
		delete process.env.NO_COLOR;
		process.env.FORCE_COLOR = "0";
		if (process.stdout) process.stdout.isTTY = true;
		expect(ansiWrap("abc", "\x1b[31m")).toBe("abc");
	});
	test("enables colour on an interactive TTY", () => {
		delete process.env.NO_COLOR;
		delete process.env.FORCE_COLOR;
		delete process.env.TERM;
		if (process.stdout) process.stdout.isTTY = true;
		expect(ansiWrap("abc", "\x1b[31m")).toBe(`\x1b[31mabc${ANSI_RESET}`);
	});
	test("disables colour on a dumb TTY", () => {
		delete process.env.NO_COLOR;
		delete process.env.FORCE_COLOR;
		process.env.TERM = "dumb";
		if (process.stdout) process.stdout.isTTY = true;
		expect(ansiWrap("abc", "\x1b[31m")).toBe("abc");
	});
	test("disables colour by default for a non-TTY sink", () => {
		delete process.env.NO_COLOR;
		delete process.env.FORCE_COLOR;
		if (process.stdout) process.stdout.isTTY = false as unknown as true;
		expect(ansiWrap("abc", "\x1b[31m")).toBe("abc");
	});
	test("reads the environment live on each call", () => {
		// Same call, different environment, different result — proves there is no frozen capture.
		delete process.env.NO_COLOR;
		process.env.FORCE_COLOR = "1";
		const coloured = ansiWrap("abc", "\x1b[31m");
		delete process.env.FORCE_COLOR;
		process.env.NO_COLOR = "1";
		const plain = ansiWrap("abc", "\x1b[31m");
		expect(coloured).toBe(`\x1b[31mabc${ANSI_RESET}`);
		expect(plain).toBe("abc");
	});
});

describe("ANSI icons", () => {
	test("colour seamlessly inside template literals when colour is supported", () => {
		delete process.env.NO_COLOR;
		process.env.FORCE_COLOR = "1";
		expect(`${ANSI_SUCCESS}`).toBe(`\x1b[32m✓${ANSI_RESET}`);
	});
	test("re-evaluate against the live environment (late-populated env)", () => {
		// Simulates a runtime that populates env vars after module-load: the icon must reflect the new value.
		delete process.env.NO_COLOR;
		process.env.FORCE_COLOR = "1";
		expect(`${ANSI_SUCCESS}`).toBe(`\x1b[32m✓${ANSI_RESET}`);
		delete process.env.FORCE_COLOR;
		process.env.NO_COLOR = "yes";
		expect(`${ANSI_SUCCESS}`).toBe("✓");
	});
});
