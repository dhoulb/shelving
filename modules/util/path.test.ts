import { getAbsolutePath, isAbsolutePath, isPathProud } from "../index.js";

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
test("getAbsolutePath()", () => {
	// Relative paths.
	expect(getAbsolutePath("./a/b/c")).toBe("/a/b/c");
	expect(getAbsolutePath("./b/c", "/a")).toBe("/a/b/c");

	// Absolute paths.
	expect(getAbsolutePath("/a/b/c")).toBe("/a/b/c");
	expect(getAbsolutePath("/b/c", "/a")).toBe("/b/c");

	// Remove redundant `/./` paths.
	expect(getAbsolutePath("/a/./b")).toBe("/a/b");
	expect(getAbsolutePath("/a/b/.")).toBe("/a/b");

	// Convert windows slashes.
	expect(getAbsolutePath("/a\\b/c")).toBe("/a/b/c");

	// Normalise double slashes.
	expect(getAbsolutePath("./b//c", "/a")).toBe("/a/b/c");
	expect(getAbsolutePath("./b///c", "/a")).toBe("/a/b/c");
	expect(getAbsolutePath("./b/c", "//a")).toBe("/a/b/c");
	expect(getAbsolutePath("./b/c", "//a")).toBe("/a/b/c");

	// Remove trailing slashes.
	expect(getAbsolutePath("./b/c/", "/a")).toBe("/a/b/c");
	expect(getAbsolutePath("/b/c/", "/a")).toBe("/b/c");
	expect(getAbsolutePath("./b/c//", "/a")).toBe("/a/b/c");
	expect(getAbsolutePath("/b/c//", "/a")).toBe("/b/c");
	expect(getAbsolutePath("./b/c///", "/a")).toBe("/a/b/c");
	expect(getAbsolutePath("/b/c///", "/a")).toBe("/b/c");

	// Resolve relative paths.
	expect(getAbsolutePath("./a/../b")).toBe("/b");
	expect(getAbsolutePath("/a/../b")).toBe("/b");
	expect(getAbsolutePath("./a/../../b")).toBe("/b");
	expect(getAbsolutePath("/a/../../b")).toBe("/b");
	expect(getAbsolutePath("./a/../b/../c/../d")).toBe("/d");
	expect(getAbsolutePath("/a/../b/../c/../d")).toBe("/d");
	expect(getAbsolutePath("./../../a")).toBe("/a");
	expect(getAbsolutePath("/../../a")).toBe("/a");
	expect(getAbsolutePath("../../a")).toBe("/a");
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
