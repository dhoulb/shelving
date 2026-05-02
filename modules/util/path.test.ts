import { describe, expect, test } from "bun:test";
import {
	getAbsolutePath,
	isAbsolutePath,
	isPathProud,
	matchPathPrefix,
	type RelativePath,
	RequiredError,
	requireAbsolutePath,
} from "../index.js";

test("isAbsolutePath()", () => {
	// Absolute.
	expect(isAbsolutePath("/")).toBe(true);
	expect(isAbsolutePath("/a")).toBe(true);
	expect(isAbsolutePath("/a/b")).toBe(true);

	// Relative.
	expect(isAbsolutePath("./a")).toBe(false);
	expect(isAbsolutePath("./a/b")).toBe(false);
	// expect(isAbsolutePath("../a")).toBe(false);
	// expect(isAbsolutePath("../a/b")).toBe(false);

	// Edge cases.
	expect(isAbsolutePath(".")).toBe(false);
	// expect(isAbsolutePath("..")).toBe(false);
});
describe("getAbsolutePath()", () => {
	test("Valid paths", () => {
		// Relative paths.
		expect(getAbsolutePath("./a/b/c")).toBe("/a/b/c");
		expect(getAbsolutePath("a/b/c")).toBe("/a/b/c");

		// Relative paths with base path.
		expect(getAbsolutePath("./b/c", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("./b/c", "/a/")).toBe("/a/b/c");
		expect(getAbsolutePath("b/c", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("b/c", "/a/")).toBe("/a/b/c");

		// Absolute paths.
		expect(getAbsolutePath("/a/b/c")).toBe("/a/b/c");
		expect(getAbsolutePath("/b/c", "/a")).toBe("/b/c");

		// Remove redundant `/./` paths.
		expect(getAbsolutePath("./a/./b")).toBe("/a/b");
		expect(getAbsolutePath("./a/b/.")).toBe("/a/b");
		expect(getAbsolutePath("/a/./b")).toBe("/a/b");
		expect(getAbsolutePath("/a/b/.")).toBe("/a/b");
		expect(getAbsolutePath("a/./b")).toBe("/a/b");
		expect(getAbsolutePath("a/b/.")).toBe("/a/b");

		// Convert windows slashes.
		expect(getAbsolutePath("/a\\b/c")).toBe("/a/b/c");

		// Normalise double slashes.
		expect(getAbsolutePath("./b//c", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("/b///c", "/a")).toBe("/b/c");
		expect(getAbsolutePath("b///c", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("c", "//a/b")).toBe("/a/b/c");
		expect(getAbsolutePath("c", "/a//b")).toBe("/a/b/c");

		// Remove trailing slashes.
		expect(getAbsolutePath("./b/c/", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("/b/c/", "/a")).toBe("/b/c");
		expect(getAbsolutePath("b/c/", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("./b/c//", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("/b/c//", "/a")).toBe("/b/c");
		expect(getAbsolutePath("b/c//", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("./b/c///", "/a")).toBe("/a/b/c");
		expect(getAbsolutePath("/b/c///", "/a")).toBe("/b/c");
		expect(getAbsolutePath("b/c///", "/a")).toBe("/a/b/c");

		// Resolve relative paths.
		// expect(getAbsolutePath("./a/../b")).toBe("/b");
		// expect(getAbsolutePath("/a/../b")).toBe("/b");
		// expect(getAbsolutePath("./a/../../b")).toBe("/b");
		// expect(getAbsolutePath("/a/../../b")).toBe("/b");
		// expect(getAbsolutePath("./a/../b/../c/../d")).toBe("/d");
		// expect(getAbsolutePath("/a/../b/../c/../d")).toBe("/d");
		// expect(getAbsolutePath("a/../b/../c/../d")).toBe("/d");
		// expect(getAbsolutePath("./../../a")).toBe("/a");
		// expect(getAbsolutePath("/../../a")).toBe("/a");
		// expect(getAbsolutePath("../../a")).toBe("/a");

		// Query and hash are stripped.
		// expect(getAbsolutePath("/a/b/c?d=d")).toBe("/a/b/c");
		// expect(getAbsolutePath("/a/b/c/?d=d")).toBe("/a/b/c");
		// expect(getAbsolutePath("/a/b/c#e")).toBe("/a/b/c");
		// expect(getAbsolutePath("/a/b/c/#e")).toBe("/a/b/c");
		// expect(getAbsolutePath("/a/b/c?d=d#e")).toBe("/a/b/c");
		// expect(getAbsolutePath("/a/b/c/?d=d#e")).toBe("/a/b/c");

		// Query and hash in base path are stripped.
		// expect(getAbsolutePath("./", "/a/b/c?q=1")).toBe("/a/b/c");
		// expect(getAbsolutePath("foo", "/a/b/c?q=1")).toBe("/a/b/c/foo");
		// expect(getAbsolutePath("?q=2", "/a/b/c?q=1")).toBe("/a/b/c");
		// expect(getAbsolutePath("./", "/a/b/c#frag")).toBe("/a/b/c");
		// expect(getAbsolutePath("foo", "/a/b/c#frag")).toBe("/a/b/c/foo");
		// expect(getAbsolutePath("./", "/a/b/c?q=1#frag")).toBe("/a/b/c");
		// expect(getAbsolutePath("./", "/a/b/c?q=1#frag")).toBe("/a/b/cg");
		// expect(getAbsolutePath("a/../b/../c/../d")).toBe("/d");
		// expect(getAbsolutePath("./../../a")).toBe("/a");
		// expect(getAbsolutePath("/../../a")).toBe("/a");
		// expect(getAbsolutePath("../../a")).toBe("/a");

		// Edge cases.
		expect(getAbsolutePath("..")).toBe("/");
		expect(getAbsolutePath(".")).toBe("/");
	});
	test("Unparseable paths", () => {
		expect(getAbsolutePath("")).toBe(undefined);
	});
});
describe("requireAbsolutePath()", () => {
	test("Unparseable paths", () => {
		expect(() => requireAbsolutePath("" as RelativePath)).toThrow(RequiredError);
	});
});
test("isPathProud()", () => {
	// Active.
	expect(isPathProud("/", "/")).toBe(true);
	expect(isPathProud("/a", "/a")).toBe(true);
	expect(isPathProud("/a/b", "/a/b")).toBe(true);

	// Proud.
	expect(isPathProud("/a/b", "/a")).toBe(true);
	expect(isPathProud("/a/b/c", "/a/b")).toBe(true);

	// Children of root are never proud.
	expect(isPathProud("/", "/a/b")).toBe(false);
});
describe("matchPathPrefix()", () => {
	test("matches and strips base prefix by path segment", () => {
		expect(matchPathPrefix("/abc/def", "/abc")).toBe("/def");
		expect(matchPathPrefix("/abc/def", "/abc/")).toBe("/def");
		expect(matchPathPrefix("/abc", "/abc")).toBe("/");
		expect(matchPathPrefix("/abc", "/abcd")).toBeUndefined();
		expect(matchPathPrefix("/abcd", "/abc")).toBeUndefined();
	});
});
