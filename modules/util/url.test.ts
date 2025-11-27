import { describe, expect, test } from "bun:test";
import { getURL, isURL, requireURL } from "../index.js";

describe("isURL()", () => {
	test("returns true for URL instance", () => {
		expect(isURL(new URL("https://a.com"))).toBe(true);
	});
	test("returns false for string", () => {
		expect(isURL("https://a.com")).toBe(false);
	});
});
describe("getURL()", () => {
	test("returns URL for string", () => {
		const url = getURL("https://a.com");
		expect(url).toBeInstanceOf(URL);
		expect(url?.href).toBe("https://a.com/");
	});
	test("returns undefined for invalid string", () => {
		expect(getURL("not a url")).toBeUndefined();
	});
	test("returns URL when URL.parse is unavailable", () => {
		const ctor = URL as typeof URL & { parse?: (value: string | URL, base?: string | URL) => URL | null };
		const descriptor = Object.getOwnPropertyDescriptor(ctor, "parse");
		try {
			if (descriptor) Reflect.deleteProperty(ctor, "parse");
			const url = getURL("https://a.com");
			expect(url).toBeInstanceOf(URL);
			expect(url?.href).toBe("https://a.com/");
		} finally {
			if (descriptor) Object.defineProperty(ctor, "parse", descriptor);
		}
	});
});
describe("requireURL()", () => {
	test("returns URL for valid input", () => {
		expect(requireURL("https://a.com")).toBeInstanceOf(URL);
	});
	test("throws for invalid input", () => {
		expect(() => requireURL("not a url")).toThrow();
	});
});
