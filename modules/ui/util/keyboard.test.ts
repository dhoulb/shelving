import { afterEach, describe, expect, test } from "bun:test";
import { isKeyboardOpen, waitForKeyboard } from "shelving/ui";

/** Pretend to be a browser window with these sizes (numbers from a real iPhone). */
function _window(innerHeight: number, height: number, offsetTop: number, scale = 1): void {
	(globalThis as { window?: unknown }).window = { innerHeight, visualViewport: { height, offsetTop, scale } };
}

describe("keyboard", () => {
	afterEach(() => {
		delete (globalThis as { window?: unknown }).window;
	});

	test("isKeyboardOpen() is true when the keyboard squashes the visual viewport", () => {
		_window(684, 383, 0);
		expect(isKeyboardOpen()).toBe(true);
	});

	test("isKeyboardOpen() is true when the keyboard shrinks the window and pushes the visual viewport up", () => {
		_window(383, 383, 301);
		expect(isKeyboardOpen()).toBe(true);
	});

	test("isKeyboardOpen() is false with the keyboard down", () => {
		_window(684, 684, 0);
		expect(isKeyboardOpen()).toBe(false);
	});

	test("isKeyboardOpen() is false when the page is zoomed in", () => {
		_window(684, 300, 200, 2);
		expect(isKeyboardOpen()).toBe(false);
	});

	test("isKeyboardOpen() is false with no window", () => {
		expect(isKeyboardOpen()).toBe(false);
	});

	test("waitForKeyboard() returns nothing with no window, so a caller goes on at once", () => {
		expect(waitForKeyboard()).toBeUndefined();
	});
});
