import { ValueError, getPath, isAbsolutePath, isPathProud } from "../index.js";

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
describe("getPath()", () => {
	test("Valid paths", () => {
		// Relative paths.
		expect(getPath("./a/b/c")).toBe("/a/b/c");
		expect(getPath("./b/c", "/a")).toBe("/a/b/c");
		expect(getPath("a/b/c")).toBe("/a/b/c");
		expect(getPath("b/c", "/a")).toBe("/a/b/c");

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
		expect(getPath("./a/../b")).toBe("/b");
		expect(getPath("/a/../b")).toBe("/b");
		expect(getPath("./a/../../b")).toBe("/b");
		expect(getPath("/a/../../b")).toBe("/b");
		expect(getPath("./a/../b/../c/../d")).toBe("/d");
		expect(getPath("/a/../b/../c/../d")).toBe("/d");
		expect(getPath("a/../b/../c/../d")).toBe("/d");
		expect(getPath("./../../a")).toBe("/a");
		expect(getPath("/../../a")).toBe("/a");
		expect(getPath("../../a")).toBe("/a");

		// Search query and hash are kept.
		expect(getPath("/a/b/c?d=d#e")).toBe("/a/b/c?d=d#e");
		expect(getPath("/a/b/c/?d=d#e")).toBe("/a/b/c?d=d#e");

		// Edge cases.
		expect(getPath("..")).toBe("/");
		expect(getPath(".")).toBe("/");
		expect(getPath("")).toBe("/");
	});
	test("Invalid paths", () => {
		// Non-https schemes don't have a path starting with `/` so they're always invalid.
		expect(() => getPath("mailto:a@b.com")).toThrow(ValueError);
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
