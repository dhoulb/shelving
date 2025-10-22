import { describe, expect, test } from "bun:test";
import {
	getURL,
	getURLParam,
	getURLParams,
	isURL,
	omitURLParam,
	omitURLParams,
	RequiredError,
	requireURL,
	requireURLParam,
	withURLParam,
	withURLParams,
} from "../index.js";

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
});
describe("requireURL()", () => {
	test("returns URL for valid input", () => {
		expect(requireURL("https://a.com")).toBeInstanceOf(URL);
	});
	test("throws for invalid input", () => {
		expect(() => requireURL("not a url")).toThrow();
	});
});
describe("getURLParams()", () => {
	test("returns params from URL", () => {
		expect(getURLParams("https://a.com/?a=1&b=2")).toEqual({ a: "1", b: "2" });
		expect(getURLParams(new URL("https://a.com/?a=1&b=2"))).toEqual({ a: "1", b: "2" });
	});
});
describe("getURLParam()", () => {
	test("gets param from URL", () => {
		// Data input.
		expect(getURLParam({ foo: "bar", baz: "qux" }, "foo")).toBe("bar");
		expect(getURLParam({ foo: "bar", baz: "qux" }, "missing")).toBeUndefined();

		// SearchParams input.
		expect(getURLParam(new URLSearchParams("foo=bar&baz=qux"), "foo")).toBe("bar");
		expect(getURLParam(new URLSearchParams("foo=bar&baz=qux"), "missing")).toBeUndefined();

		// String URL input.
		expect(getURLParam("https://a.com/?foo=bar", "foo")).toBe("bar");
		expect(getURLParam("https://a.com/?foo=bar", "missing")).toBeUndefined();

		// URL input.
		expect(getURLParam(new URL("https://a.com/?foo=bar"), "foo")).toBe("bar");
		expect(getURLParam(new URL("https://a.com/?foo=bar"), "missing")).toBeUndefined();
	});
});
describe("requireURLParam()", () => {
	test("returns param value or throws for missing param", () => {
		// Data input.
		expect(requireURLParam({ foo: "bar", baz: "qux" }, "foo")).toBe("bar");
		expect(() => requireURLParam({ foo: "bar", baz: "qux" }, "missing")).toThrow(RequiredError);

		// SearchParams input.
		expect(requireURLParam(new URLSearchParams("foo=bar&baz=qux"), "foo")).toBe("bar");
		expect(() => requireURLParam(new URLSearchParams("foo=bar&baz=qux"), "missing")).toThrow(RequiredError);

		// String URL input.
		expect(requireURLParam("https://a.com/?foo=bar", "foo")).toBe("bar");
		expect(() => requireURLParam("https://a.com/?foo=bar", "missing")).toThrow(RequiredError);

		// URL input.
		expect(requireURLParam(new URL("https://a.com/?foo=bar"), "foo")).toBe("bar");
		expect(() => requireURLParam(new URL("https://a.com/?foo=bar"), "missing")).toThrow(RequiredError);
	});
});
describe("withURLParam()", () => {
	test("sets param", () => {
		expect(withURLParam("https://a.com", "a", "1").href).toBe("https://a.com/?a=1");
		expect(withURLParam("https://a.com?c=3", "a", "1").href).toBe("https://a.com/?c=3&a=1");
		expect(withURLParam(new URL("https://a.com"), "a", "1").href).toBe("https://a.com/?a=1");
		expect(withURLParam(new URL("https://a.com?c=3"), "a", "1").href).toBe("https://a.com/?c=3&a=1");
	});
	test("converts values", () => {
		expect(withURLParam("https://a.com", "a", "1").href).toBe("https://a.com/?a=1");
		expect(withURLParam("https://a.com", "a", 123).href).toBe("https://a.com/?a=123");
		expect(withURLParam("https://a.com", "a", true).href).toBe("https://a.com/?a=true");
		expect(withURLParam("https://a.com", "a", [1, true, "b"]).href).toBe("https://a.com/?a=1%2Ctrue%2Cb");
	});
});
describe("withURLParams()", () => {
	test("sets multiple params with data", () => {
		// Data input.
		expect(withURLParams("https://a.com", { a: 1, b: "2" }).href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams("https://a.com?c=3", { a: 1, b: "2" }).href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURLParams(new URL("https://a.com"), { a: 1, b: "2" }).href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams(new URL("https://a.com?c=3"), { a: 1, b: "2" }).href).toBe("https://a.com/?c=3&a=1&b=2");

		// SearchParams input.
		expect(withURLParams("https://a.com", new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams("https://a.com?c=3", new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURLParams(new URL("https://a.com"), new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams(new URL("https://a.com?c=3"), new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");

		// String URL input.
		expect(withURLParams("https://a.com", "https://a.com?a=1&b=2").href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams("https://a.com?c=3", "https://a.com?a=1&b=2").href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURLParams(new URL("https://a.com"), "https://a.com?a=1&b=2").href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams(new URL("https://a.com?c=3"), "https://a.com?a=1&b=2").href).toBe("https://a.com/?c=3&a=1&b=2");

		// URL input.
		expect(withURLParams("https://a.com", new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams("https://a.com?c=3", new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURLParams(new URL("https://a.com"), new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURLParams(new URL("https://a.com?c=3"), new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");
	});
});
describe("omitURLParams()", () => {
	test("removes params", () => {
		expect(omitURLParams("https://a.com?a=1&b=2", "a").href).toBe("https://a.com/?b=2");
		expect(omitURLParams("https://a.com?a=1&b=2", "a", "b").href).toBe("https://a.com/");
		expect(omitURLParams("https://a.com?a=1&b=2", "a", "b", "c").href).toBe("https://a.com/");
		expect(omitURLParams("https://a.com", "a", "b", "c").href).toBe("https://a.com/");
		expect(omitURLParams(new URL("https://a.com?a=1&b=2"), "a").href).toBe("https://a.com/?b=2");
		expect(omitURLParams(new URL("https://a.com?a=1&b=2"), "a", "b").href).toBe("https://a.com/");
		expect(omitURLParams(new URL("https://a.com?a=1&b=2"), "a", "b", "c").href).toBe("https://a.com/");
		expect(omitURLParams(new URL("https://a.com"), "a", "b", "c").href).toBe("https://a.com/");
	});
});
describe("omitURLParam()", () => {
	test("removes single param", () => {
		expect(omitURLParam("https://a.com?a=1&b=2", "b").href).toBe("https://a.com/?a=1");
		expect(omitURLParam(new URL("https://a.com?a=1&b=2"), "b").href).toBe("https://a.com/?a=1");
		expect(omitURLParam("https://a.com?a=1&b=2", "c").href).toBe("https://a.com/?a=1");
		expect(omitURLParam(new URL("https://a.com?a=1&b=2"), "c").href).toBe("https://a.com/?a=1");
	});
});
