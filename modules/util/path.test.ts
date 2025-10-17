import { describe, expect, test } from "bun:test";
import { isAbsolutePath, isPathProud, RequiredError, requirePath } from "../index.js";

test("isAbsolutePath()", () => {
	// Absolute.
	expect(isAbsolutePath("/")).toBe(true);
	expect(isAbsolutePath("/a")).toBe(true);
	expect(isAbsolutePath("/a/b")).toBe(true);

	// Relative.
	expect(isAbsolutePath("a")).toBe(false);
	expect(isAbsolutePath("a/b")).toBe(false);
	expect(isAbsolutePath("./a")).toBe(false);
	expect(isAbsolutePath("./a/b")).toBe(false);
	expect(isAbsolutePath("../a")).toBe(false);
	expect(isAbsolutePath("../a/b")).toBe(false);

	// Edge cases.
	expect(isAbsolutePath("")).toBe(false);
	expect(isAbsolutePath(".")).toBe(false);
	expect(isAbsolutePath("..")).toBe(false);
});
describe("requirePath()", () => {
	test("Valid paths", () => {
		// Relative paths.
		expect(requirePath("./a/b/c")).toBe("/a/b/c");
		expect(requirePath("./b/c", "/a")).toBe("/a/b/c");
		expect(requirePath("a/b/c")).toBe("/a/b/c");
		expect(requirePath("b/c", "/a")).toBe("/a/b/c");

		// Absolute paths.
		expect(requirePath("/a/b/c")).toBe("/a/b/c");
		expect(requirePath("/b/c", "/a")).toBe("/b/c");

		// Remove redundant `/./` paths.
		expect(requirePath("./a/./b")).toBe("/a/b");
		expect(requirePath("./a/b/.")).toBe("/a/b");
		expect(requirePath("/a/./b")).toBe("/a/b");
		expect(requirePath("/a/b/.")).toBe("/a/b");
		expect(requirePath("a/./b")).toBe("/a/b");
		expect(requirePath("a/b/.")).toBe("/a/b");

		// Convert windows slashes.
		expect(requirePath("/a\\b/c")).toBe("/a/b/c");

		// Normalise double slashes.
		expect(requirePath("./b//c", "/a")).toBe("/a/b/c");
		expect(requirePath("/b///c", "/a")).toBe("/b/c");
		expect(requirePath("b///c", "/a")).toBe("/a/b/c");
		expect(requirePath("c", "//a/b")).toBe("/a/b/c");
		expect(requirePath("c", "/a//b")).toBe("/a/b/c");

		// Remove trailing slashes.
		expect(requirePath("./b/c/", "/a")).toBe("/a/b/c");
		expect(requirePath("/b/c/", "/a")).toBe("/b/c");
		expect(requirePath("b/c/", "/a")).toBe("/a/b/c");
		expect(requirePath("./b/c//", "/a")).toBe("/a/b/c");
		expect(requirePath("/b/c//", "/a")).toBe("/b/c");
		expect(requirePath("b/c//", "/a")).toBe("/a/b/c");
		expect(requirePath("./b/c///", "/a")).toBe("/a/b/c");
		expect(requirePath("/b/c///", "/a")).toBe("/b/c");
		expect(requirePath("b/c///", "/a")).toBe("/a/b/c");

		// Resolve relative paths.
		expect(requirePath("./a/../b")).toBe("/b");
		expect(requirePath("/a/../b")).toBe("/b");
		expect(requirePath("./a/../../b")).toBe("/b");
		expect(requirePath("/a/../../b")).toBe("/b");
		expect(requirePath("./a/../b/../c/../d")).toBe("/d");
		expect(requirePath("/a/../b/../c/../d")).toBe("/d");
		expect(requirePath("a/../b/../c/../d")).toBe("/d");
		expect(requirePath("./../../a")).toBe("/a");
		expect(requirePath("/../../a")).toBe("/a");
		expect(requirePath("../../a")).toBe("/a");

		// Search query and hash are kept.
		expect(requirePath("/a/b/c?d=d#e")).toBe("/a/b/c?d=d#e");
		expect(requirePath("/a/b/c/?d=d#e")).toBe("/a/b/c?d=d#e");

		// Edge cases.
		expect(requirePath("..")).toBe("/");
		expect(requirePath(".")).toBe("/");
		expect(requirePath("")).toBe("/");
	});
	test("Invalid paths", () => {
		// Non-https schemes don't have a path starting with `/` so they're always invalid.
		expect(() => requirePath("mailto:a@b.com")).toThrow(RequiredError);
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
