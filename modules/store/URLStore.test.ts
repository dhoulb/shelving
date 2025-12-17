import { describe, expect, test } from "bun:test";
import { RequiredError, URLStore } from "../index.js";

describe("URLStore", () => {
	test("constructor: creates store with URL string", () => {
		const store = new URLStore("https://example.com/path");
		expect(store.href).toBe("https://example.com/path");
	});
	test("constructor: creates store with base URL", () => {
		const store = new URLStore("/path", "https://example.com");
		expect(store.href).toBe("https://example.com/path");
	});
	test("href: returns full URL string", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		expect(store.href).toBe("https://example.com/path?foo=bar");
	});
	test("origin: returns origin", () => {
		const store = new URLStore("https://example.com/path");
		expect(store.origin).toBe("https://example.com");
	});
	test("protocol: returns protocol", () => {
		const store = new URLStore("https://example.com/path");
		expect(store.protocol).toBe("https:");
	});
	test("hostname: returns hostname", () => {
		const store = new URLStore("https://example.com/path");
		expect(store.hostname).toBe("example.com");
	});
	test("host: returns host with port", () => {
		const store = new URLStore("https://example.com:8080/path");
		expect(store.host).toBe("example.com:8080");
	});
	test("port: returns port", () => {
		const store = new URLStore("https://example.com:8080/path");
		expect(store.port).toBe("8080");
	});
	test("pathname: returns pathname", () => {
		const store = new URLStore("https://example.com/path/to/resource");
		expect(store.pathname).toBe("/path/to/resource");
	});
	test("search: returns search string", () => {
		const store = new URLStore("https://example.com/path?foo=bar&baz=qux");
		expect(store.search).toBe("?foo=bar&baz=qux");
	});
	test("params: returns params as dictionary", () => {
		const store = new URLStore("https://example.com/path?foo=bar&baz=qux");
		expect(store.params).toEqual({ foo: "bar", baz: "qux" });
	});
});
describe("getParam()", () => {
	test("returns param value", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		expect(store.getParam("foo")).toBe("bar");
	});
	test("returns undefined for missing param", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		expect(store.getParam("missing")).toBeUndefined();
	});
});
describe("requireParam()", () => {
	test("returns param value", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		expect(store.requireParam("foo")).toBe("bar");
	});
	test("throws for missing param", () => {
		const store = new URLStore("https://example.com/path");
		expect(() => store.requireParam("missing")).toThrow(RequiredError);
	});
});
describe("withParam()", () => {
	test("returns URL with new param without mutating", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		const result = store.withParam("baz", "qux");
		expect(result.href).toBe("https://example.com/path?foo=bar&baz=qux");
		expect(store.href).toBe("https://example.com/path?foo=bar");
	});
});
describe("withParams()", () => {
	test("merges with existing params", () => {
		const store = new URLStore("https://example.com/path?status=review");
		const result = store.withParams({ name: "john" });
		expect(result.href).toBe("https://example.com/path?status=review&name=john");
	});
	test("does not mutate original", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		store.withParams({ baz: "qux" });
		expect(store.href).toBe("https://example.com/path?foo=bar");
	});
});
describe("setParams()", () => {
	test("clears existing params and sets new ones", () => {
		const store1 = new URLStore("https://example.com/path?status=review&page=1");
		store1.setParams({ name: "john" });
		const href = store1.href;
		const url = store1.value;
		expect(store1.href).toBe("https://example.com/path?name=john");

		const store2 = new URLStore("https://example.com/path?status=review&page=1");
		store2.setParams({});
		expect(store2.href).toBe("https://example.com/path");
	});
	test("filters out undefined, null, and empty string values", () => {
		const store = new URLStore("https://example.com/path?existing=value");
		store.setParams({
			keep: "yes",
			undefinedVal: undefined,
			// nullVal: null,
			emptyVal: "",
			zeroVal: 0,
		});
		expect(store.href).toBe("https://example.com/path?keep=yes&emptyVal=&zeroVal=0");
	});
	test("returns URL with no params when all values are filtered", () => {
		const store = new URLStore("https://example.com/path?status=review");
		store.setParams({
			patientId: undefined,
			doctorId: undefined,
			status: undefined,
		});
		expect(store.href).toBe("https://example.com/path");
	});
	test("does not mutate the original URL", () => {
		const store = new URLStore("https://example.com/path?original=param");
		const url = store.value;
		store.setParams({ new: "value" });
		expect(url.href).toBe("https://example.com/path?original=param");
	});
});
describe("updateParams()", () => {
	test("clears existing params and sets new ones", () => {
		const store = new URLStore("https://example.com/path?status=review&page=1");
		store.updateParams({ name: "john" });
		expect(store.href).toBe("https://example.com/path?status=review&page=1&name=john");
	});
	test("filters out undefined, null, and empty string values", () => {
		const store = new URLStore("https://example.com/path?existing=value");
		store.updateParams({
			keep: "yes",
			undefinedVal: undefined,
			// nullVal: null,
			emptyVal: "",
			zeroVal: 0,
		});
		expect(store.href).toBe("https://example.com/path?existing=value&keep=yes&emptyVal=&zeroVal=0");
	});
	test("returns URL with no params when all values are filtered", () => {
		const store = new URLStore("https://example.com/path?status=review");
		store.updateParams({
			patientId: undefined,
			doctorId: undefined,
			status: undefined,
		});
		expect(store.href).toBe("https://example.com/path?status=review");
	});
	test("does not mutate the original URL", () => {
		const store = new URLStore("https://example.com/path?original=param");
		const url = store.value;
		store.updateParams({ new: "value" });
		expect(url.href).toBe("https://example.com/path?original=param");
	});
});
describe("omitParam()", () => {
	test("returns URL without param", () => {
		const store = new URLStore("https://example.com/path?foo=bar&baz=qux");
		const result = store.omitParam("foo");
		expect(result.href).toBe("https://example.com/path?baz=qux");
		expect(store.href).toBe("https://example.com/path?foo=bar&baz=qux");
	});
});
describe("omitParams()", () => {
	test("omitParams: returns URL without multiple params", () => {
		const store = new URLStore("https://example.com/path?foo=bar&baz=qux&keep=yes");
		const result = store.omitParams("foo", "baz");
		expect(result.href).toBe("https://example.com/path?keep=yes");
		expect(store.href).toBe("https://example.com/path?foo=bar&baz=qux&keep=yes");
	});
});
describe("toString()", () => {
	test("returns href", () => {
		const store = new URLStore("https://example.com/path?foo=bar");
		expect(store.toString()).toBe("https://example.com/path?foo=bar");
	});
});
