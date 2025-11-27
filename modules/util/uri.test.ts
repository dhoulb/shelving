import { describe, expect, test } from "bun:test";
import {
	getURIParam,
	getURIParams,
	omitURIParam,
	omitURIParams,
	RequiredError,
	requireURIParam,
	URL,
	withURIParam,
	withURIParams,
} from "../index.js";

describe("getURIParams()", () => {
	test("returns params from URL", () => {
		expect(getURIParams("https://a.com/?a=1&b=2")).toEqual({ a: "1", b: "2" });
		expect(getURIParams(new URL("https://a.com/?a=1&b=2"))).toEqual({ a: "1", b: "2" });
	});
});
describe("getURIParam()", () => {
	test("gets param from URL", () => {
		// Data input.
		expect(getURIParam({ foo: "bar", baz: "qux" }, "foo")).toBe("bar");
		expect(getURIParam({ foo: "bar", baz: "qux" }, "missing")).toBeUndefined();

		// SearchParams input.
		expect(getURIParam(new URLSearchParams("foo=bar&baz=qux"), "foo")).toBe("bar");
		expect(getURIParam(new URLSearchParams("foo=bar&baz=qux"), "missing")).toBeUndefined();

		// String URL input.
		expect(getURIParam("https://a.com/?foo=bar", "foo")).toBe("bar");
		expect(getURIParam("https://a.com/?foo=bar", "missing")).toBeUndefined();

		// URL input.
		expect(getURIParam(new URL("https://a.com/?foo=bar"), "foo")).toBe("bar");
		expect(getURIParam(new URL("https://a.com/?foo=bar"), "missing")).toBeUndefined();
	});
});
describe("requireURIParam()", () => {
	test("returns param value or throws for missing param", () => {
		// Data input.
		expect(requireURIParam({ foo: "bar", baz: "qux" }, "foo")).toBe("bar");
		expect(() => requireURIParam({ foo: "bar", baz: "qux" }, "missing")).toThrow(RequiredError);

		// SearchParams input.
		expect(requireURIParam(new URLSearchParams("foo=bar&baz=qux"), "foo")).toBe("bar");
		expect(() => requireURIParam(new URLSearchParams("foo=bar&baz=qux"), "missing")).toThrow(RequiredError);

		// String URL input.
		expect(requireURIParam("https://a.com/?foo=bar", "foo")).toBe("bar");
		expect(() => requireURIParam("https://a.com/?foo=bar", "missing")).toThrow(RequiredError);

		// URL input.
		expect(requireURIParam(new URL("https://a.com/?foo=bar"), "foo")).toBe("bar");
		expect(() => requireURIParam(new URL("https://a.com/?foo=bar"), "missing")).toThrow(RequiredError);
	});
});
describe("withURIParam()", () => {
	test("sets param", () => {
		expect(withURIParam("https://a.com", "a", "1").href).toBe("https://a.com/?a=1");
		expect(withURIParam("https://a.com?c=3", "a", "1").href).toBe("https://a.com/?c=3&a=1");
		expect(withURIParam(new URL("https://a.com"), "a", "1").href).toBe("https://a.com/?a=1");
		expect(withURIParam(new URL("https://a.com?c=3"), "a", "1").href).toBe("https://a.com/?c=3&a=1");
	});
	test("converts values", () => {
		expect(withURIParam("https://a.com", "a", "1").href).toBe("https://a.com/?a=1");
		expect(withURIParam("https://a.com", "a", 123).href).toBe("https://a.com/?a=123");
		expect(withURIParam("https://a.com", "a", true).href).toBe("https://a.com/?a=true");
		expect(withURIParam("https://a.com", "a", [1, true, "b"]).href).toBe("https://a.com/?a=1%2Ctrue%2Cb");
	});
	test("returns a new value", () => {
		const input = new URL("https://a.com");
		const output = withURIParam(input, "a", "1");
		expect(output).not.toBe(input);
		expect(output.href).toBe("https://a.com/?a=1");
		expect(input.href).toBe("https://a.com/");
	});
	test("returns same value if unchanged", () => {
		const input = new URL("https://a.com?a=1");
		const output = withURIParam(input, "a", "1");
		expect(output).toBe(input);
		expect(output.href).toBe("https://a.com/?a=1");
		expect(input.href).toBe("https://a.com/?a=1");
	});
});
describe("withURIParams()", () => {
	test("sets multiple params with data", () => {
		// Data input.
		expect(withURIParams("https://a.com", { a: 1, b: "2" }).href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams("https://a.com?c=3", { a: 1, b: "2" }).href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURIParams(new URL("https://a.com"), { a: 1, b: "2" }).href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams(new URL("https://a.com?c=3"), { a: 1, b: "2" }).href).toBe("https://a.com/?c=3&a=1&b=2");

		// SearchParams input.
		expect(withURIParams("https://a.com", new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams("https://a.com?c=3", new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURIParams(new URL("https://a.com"), new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams(new URL("https://a.com?c=3"), new URLSearchParams("a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");

		// String URL input.
		expect(withURIParams("https://a.com", "https://a.com?a=1&b=2").href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams("https://a.com?c=3", "https://a.com?a=1&b=2").href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURIParams(new URL("https://a.com"), "https://a.com?a=1&b=2").href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams(new URL("https://a.com?c=3"), "https://a.com?a=1&b=2").href).toBe("https://a.com/?c=3&a=1&b=2");

		// URL input.
		expect(withURIParams("https://a.com", new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams("https://a.com?c=3", new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");
		expect(withURIParams(new URL("https://a.com"), new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?a=1&b=2");
		expect(withURIParams(new URL("https://a.com?c=3"), new URL("https://a.com?a=1&b=2")).href).toBe("https://a.com/?c=3&a=1&b=2");
	});
	test("returns a new value", () => {
		const input = new URL("https://a.com");
		const output = withURIParams(input, { a: 1, b: "2" });
		expect(output).not.toBe(input);
		expect(output.href).toBe("https://a.com/?a=1&b=2");
		expect(input.href).toBe("https://a.com/");
	});
	test("returns same value if unchanged", () => {
		const input = new URL("https://a.com?a=1&b=2");
		const output = withURIParams(input, { a: 1, b: "2" });
		expect(output).toBe(input);
		expect(output.href).toBe("https://a.com/?a=1&b=2");
		expect(input.href).toBe("https://a.com/?a=1&b=2");
	});
});
describe("omitURIParams()", () => {
	test("removes params", () => {
		expect(omitURIParams("https://a.com?a=1&b=2", "a").href).toBe("https://a.com/?b=2");
		expect(omitURIParams("https://a.com?a=1&b=2", "a", "b").href).toBe("https://a.com/");
		expect(omitURIParams("https://a.com?a=1&b=2", "a", "b", "c").href).toBe("https://a.com/");
		expect(omitURIParams("https://a.com", "a", "b", "c").href).toBe("https://a.com/");
		expect(omitURIParams(new URL("https://a.com?a=1&b=2"), "a").href).toBe("https://a.com/?b=2");
		expect(omitURIParams(new URL("https://a.com?a=1&b=2"), "a", "b").href).toBe("https://a.com/");
		expect(omitURIParams(new URL("https://a.com?a=1&b=2"), "a", "b", "c").href).toBe("https://a.com/");
		expect(omitURIParams(new URL("https://a.com"), "a", "b", "c").href).toBe("https://a.com/");
	});
	test("returns a new value", () => {
		const input = new URL("https://a.com?a=1&b=2");
		const output = omitURIParams(input, "a", "b");
		expect(output).not.toBe(input);
		expect(output.href).toBe("https://a.com/");
		expect(input.href).toBe("https://a.com/?a=1&b=2");
	});
	test("returns same value if unchanged", () => {
		const input = new URL("https://a.com?a=1&b=2");
		const output = omitURIParams(input, "d", "c");
		expect(output).toBe(input);
		expect(output.href).toBe("https://a.com/?a=1&b=2");
		expect(input.href).toBe("https://a.com/?a=1&b=2");
	});
});
describe("omitURIParam()", () => {
	test("removes single param", () => {
		expect(omitURIParam("https://a.com?a=1&b=2", "b").href).toBe("https://a.com/?a=1");
		expect(omitURIParam(new URL("https://a.com?a=1&b=2"), "b").href).toBe("https://a.com/?a=1");
		expect(omitURIParam("https://a.com?a=1&b=2", "c").href).toBe("https://a.com/?a=1&b=2");
		expect(omitURIParam(new URL("https://a.com?a=1&b=2"), "c").href).toBe("https://a.com/?a=1&b=2");
	});
});
