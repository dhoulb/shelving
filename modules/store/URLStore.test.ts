import { expect, test } from "bun:test";
import { RequiredError, URLStore } from "../index.js";

// Constructor
test("constructor: creates store with URL string", () => {
	const store = new URLStore("https://example.com/path");
	expect(store.href).toBe("https://example.com/path");
});

test("constructor: creates store with base URL", () => {
	const store = new URLStore("/path", "https://example.com");
	expect(store.href).toBe("https://example.com/path");
});

// Property getters
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

// getParam / requireParam
test("getParam: returns param value", () => {
	const store = new URLStore("https://example.com/path?foo=bar");
	expect(store.getParam("foo")).toBe("bar");
});

test("getParam: returns undefined for missing param", () => {
	const store = new URLStore("https://example.com/path?foo=bar");
	expect(store.getParam("missing")).toBeUndefined();
});

test("requireParam: returns param value", () => {
	const store = new URLStore("https://example.com/path?foo=bar");
	expect(store.requireParam("foo")).toBe("bar");
});

test("requireParam: throws for missing param", () => {
	const store = new URLStore("https://example.com/path");
	expect(() => store.requireParam("missing")).toThrow(RequiredError);
});

// Note: setParam/setParams/deleteParam/deleteParams have a known limitation where
// URL changes may not be detected due to isDeepEqual considering different URL
// objects as equal. Use withParam/withParams/replaceParams/omitParams and
// assign the result to store.value instead.

// withParam / withParams (non-mutating)
test("withParam: returns URL with new param without mutating", () => {
	const store = new URLStore("https://example.com/path?foo=bar");
	const result = store.withParam("baz", "qux");
	expect(result.href).toBe("https://example.com/path?foo=bar&baz=qux");
	expect(store.href).toBe("https://example.com/path?foo=bar");
});

test("withParams: merges with existing params", () => {
	const store = new URLStore("https://example.com/path?status=review");
	const result = store.withParams({ name: "john" });
	expect(result.href).toBe("https://example.com/path?status=review&name=john");
});

test("withParams: does not mutate original", () => {
	const store = new URLStore("https://example.com/path?foo=bar");
	store.withParams({ baz: "qux" });
	expect(store.href).toBe("https://example.com/path?foo=bar");
});

// replaceParams (non-mutating)
test("replaceParams: clears existing params and sets new ones", () => {
	const store = new URLStore("https://example.com/path?status=review&page=1");
	const result = store.replaceParams({ name: "john" });
	expect(result.href).toBe("https://example.com/path?name=john");
});

test("replaceParams: filters out undefined, null, and empty string values", () => {
	const store = new URLStore("https://example.com/path?existing=value");
	const result = store.replaceParams({
		keep: "yes",
		undefinedVal: undefined,
		nullVal: null,
		emptyVal: "",
		zeroVal: 0,
	});
	expect(result.href).toBe("https://example.com/path?keep=yes&zeroVal=0");
});

test("replaceParams: returns URL with no params when all values are filtered", () => {
	const store = new URLStore("https://example.com/path?status=review");
	const result = store.replaceParams({
		patientId: undefined,
		doctorId: undefined,
		status: undefined,
	});
	expect(result.href).toBe("https://example.com/path");
});

test("replaceParams: does not mutate the original URL", () => {
	const store = new URLStore("https://example.com/path?original=param");
	store.replaceParams({ new: "value" });
	expect(store.href).toBe("https://example.com/path?original=param");
});

// omitParam / omitParams (non-mutating)
test("omitParam: returns URL without param", () => {
	const store = new URLStore("https://example.com/path?foo=bar&baz=qux");
	const result = store.omitParam("foo");
	expect(result.href).toBe("https://example.com/path?baz=qux");
	expect(store.href).toBe("https://example.com/path?foo=bar&baz=qux");
});

test("omitParams: returns URL without multiple params", () => {
	const store = new URLStore("https://example.com/path?foo=bar&baz=qux&keep=yes");
	const result = store.omitParams("foo", "baz");
	expect(result.href).toBe("https://example.com/path?keep=yes");
	expect(store.href).toBe("https://example.com/path?foo=bar&baz=qux&keep=yes");
});

// toString
test("toString: returns href", () => {
	const store = new URLStore("https://example.com/path?foo=bar");
	expect(store.toString()).toBe("https://example.com/path?foo=bar");
});
