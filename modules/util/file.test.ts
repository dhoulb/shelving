import { expect, test } from "bun:test";
import { RequiredError } from "../error/RequiredError.js";
import { getFileExtension, requireFileExtension } from "./file.js";

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
