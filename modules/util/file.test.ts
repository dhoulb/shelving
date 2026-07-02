import { expect, test } from "bun:test";
import { RequiredError } from "shelving/error";
import { getFileExtension, requireFileExtension, splitFileExtension } from "shelving/util/file";

test("getOptionalFileExtension()", () => {
	expect(getFileExtension("abc.jpg")).toBe("jpg");
	expect(getFileExtension(".jpg")).toBe("jpg");
	expect(getFileExtension("abc.something.jpg")).toBe("jpg");
	expect<string | undefined>(getFileExtension("something")).toBe(undefined);
});
test("getFileExtension()", () => {
	expect(requireFileExtension("abc.jpg")).toBe("jpg");
	expect(requireFileExtension(".jpg")).toBe("jpg");
	expect(requireFileExtension("abc.something.jpg")).toBe("jpg");
	expect(() => requireFileExtension("something")).toThrow(RequiredError);
});
test("splitFileExtension()", () => {
	expect(splitFileExtension("array.ts")).toEqual(["array", "ts"]);
	expect(splitFileExtension("some.thing.test.ts")).toEqual(["some.thing.test", "ts"]);
	expect(splitFileExtension("no-ext")).toEqual(["no-ext", undefined]);
	expect(splitFileExtension(".gitignore")).toEqual([undefined, "gitignore"]);
	expect(splitFileExtension("README")).toEqual(["README", undefined]);
	expect(splitFileExtension("")).toEqual([undefined, undefined]);
	expect(splitFileExtension(null)).toEqual([undefined, undefined]);
	expect(splitFileExtension(undefined)).toEqual([undefined, undefined]);
});
