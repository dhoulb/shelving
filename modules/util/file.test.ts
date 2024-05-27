import { expect, test } from "bun:test";
import { ValueError } from "../index.js";
import { getFileExtension, getOptionalFileExtension } from "./file.js";

test("getOptionalFileExtension()", () => {
	expect(getOptionalFileExtension("abc.jpg")).toBe("jpg");
	expect(getOptionalFileExtension(".jpg")).toBe("jpg");
	expect(getOptionalFileExtension("abc.something.jpg")).toBe("jpg");
	expect<string | undefined>(getOptionalFileExtension("something")).toBe(undefined);
});
test("getFileExtension()", () => {
	expect(getFileExtension("abc.jpg")).toBe("jpg");
	expect(getFileExtension(".jpg")).toBe("jpg");
	expect(getFileExtension("abc.something.jpg")).toBe("jpg");
	expect(() => getFileExtension("something")).toThrow(ValueError);
});
