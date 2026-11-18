import { describe, expect, test } from "bun:test";
import { isKeyboardOpen, waitForKeyboard } from "shelving/ui";

describe("keyboard", () => {
	test("isKeyboardOpen() is false with no window", () => {
		expect(isKeyboardOpen()).toBe(false);
	});

	test("waitForKeyboard() returns nothing with no window, so a caller goes on at once", () => {
		expect(waitForKeyboard()).toBeUndefined();
	});
});
