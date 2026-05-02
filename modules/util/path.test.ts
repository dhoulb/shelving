import { describe, expect, test } from "bun:test";
import { getPath, isAbsolutePath, isPathProud, matchPathPrefix, type RelativePath, RequiredError, requirePath } from "../index.js";

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
describe("getPath()", () => {
	test("Valid paths", () => {
		// Relative paths.
		expect(getPath("./a/b/c")).toBe("/a/b/c");
		expect(getPath("a/b/c")).toBe("/a/b/c");

		// Relative paths with base path.
		expect(getPath("./b/c", "/a")).toBe("/a/b/c");
		expect(getPath("./b/c", "/a/")).toBe("/a/b/c");
		expect(getPath("b/c", "/a")).toBe("/a/b/c");
		expect(getPath("b/c", "/a/")).toBe("/a/b/c");

		// Absolute paths.
		expect(getPath("/a/b/c")).toBe("/a/b/c");
		expect(getPath("/b/c", "/a")).toBe("/b/c");

		// Remove redundant `/./` paths.
		expect(getPath("./a/./b")).toBe("/a/b");
		expect(getPath("./a/b/.")).toBe("/a/b");
		expect(getPath("/a/./b")).toBe("/a/b");
		expect(getPath("/a/b/.")).toBe("/a/b");
		expect(getPath("a/./b")).toBe("/a/b");
		expect(getPath("a/b/.")).toBe("/a/b");

		// Convert windows slashes.
		expect(getPath("/a\\b/c")).toBe("/a/b/c");

		// Normalise double slashes.
		expect(getPath("./b//c", "/a")).toBe("/a/b/c");
		expect(getPath("/b///c", "/a")).toBe("/b/c");
		expect(getPath("b///c", "/a")).toBe("/a/b/c");
		expect(getPath("c", "//a/b")).toBe("/a/b/c");
		expect(getPath("c", "/a//b")).toBe("/a/b/c");

		// Remove trailing slashes.
		expect(getPath("./b/c/", "/a")).toBe("/a/b/c");
		expect(getPath("/b/c/", "/a")).toBe("/b/c");
		expect(getPath("b/c/", "/a")).toBe("/a/b/c");
		expect(getPath("./b/c//", "/a")).toBe("/a/b/c");
		expect(getPath("/b/c//", "/a")).toBe("/b/c");
		expect(getPath("b/c//", "/a")).toBe("/a/b/c");
		expect(getPath("./b/c///", "/a")).toBe("/a/b/c");
		expect(getPath("/b/c///", "/a")).toBe("/b/c");
		expect(getPath("b/c///", "/a")).toBe("/a/b/c");

		// Resolve relative paths.
		// expect(getPath("./a/../b")).toBe("/b");
		// expect(getPath("/a/../b")).toBe("/b");
		// expect(getPath("./a/../../b")).toBe("/b");
		// expect(getPath("/a/../../b")).toBe("/b");
		// expect(getPath("./a/../b/../c/../d")).toBe("/d");
		// expect(getPath("/a/../b/../c/../d")).toBe("/d");
		// expect(getPath("a/../b/../c/../d")).toBe("/d");
		// expect(getPath("./../../a")).toBe("/a");
		// expect(getPath("/../../a")).toBe("/a");
		// expect(getPath("../../a")).toBe("/a");

		// Query and hash are stripped.
		// expect(getPath("/a/b/c?d=d")).toBe("/a/b/c");
		// expect(getPath("/a/b/c/?d=d")).toBe("/a/b/c");
		// expect(getPath("/a/b/c#e")).toBe("/a/b/c");
		// expect(getPath("/a/b/c/#e")).toBe("/a/b/c");
		// expect(getPath("/a/b/c?d=d#e")).toBe("/a/b/c");
		// expect(getPath("/a/b/c/?d=d#e")).toBe("/a/b/c");

		// Query and hash in base path are stripped.
		// expect(getPath("./", "/a/b/c?q=1")).toBe("/a/b/c");
		// expect(getPath("foo", "/a/b/c?q=1")).toBe("/a/b/c/foo");
		// expect(getPath("?q=2", "/a/b/c?q=1")).toBe("/a/b/c");
		// expect(getPath("./", "/a/b/c#frag")).toBe("/a/b/c");
		// expect(getPath("foo", "/a/b/c#frag")).toBe("/a/b/c/foo");
		// expect(getPath("./", "/a/b/c?q=1#frag")).toBe("/a/b/c");
		// expect(getPath("./", "/a/b/c?q=1#frag")).toBe("/a/b/cg");
		// expect(getPath("a/../b/../c/../d")).toBe("/d");
		// expect(getPath("./../../a")).toBe("/a");
		// expect(getPath("/../../a")).toBe("/a");
		// expect(getPath("../../a")).toBe("/a");

		// Edge cases.
		expect(getPath("..")).toBe("/");
		expect(getPath(".")).toBe("/");
	});
	test("Unparseable paths", () => {
		expect(getPath("")).toBe(undefined);
	});
});
describe("requirePath()", () => {
	test("Unparseable paths", () => {
		expect(() => requirePath("" as RelativePath)).toThrow(RequiredError);
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
