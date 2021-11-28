import { getProp } from "../index.js";

test("getProp()", () => {
	const testObj = { a: "A", 1: 1 };
	const deepObj = { ...testObj, deep: { ...testObj, deeper: { ...testObj } } };
	// Works correctly.
	expect(getProp(deepObj, "a")).toBe("A");
	expect(getProp(deepObj, 1)).toBe(1);
	expect(getProp(deepObj, "deep", "a")).toBe("A");
	expect(getProp(deepObj, "deep", 1)).toBe(1);
	expect(getProp(deepObj, "deep", "deeper", "a")).toBe("A");
	expect(getProp(deepObj, "deep", "deeper", 1)).toBe(1);
	// Works correctly for not found values.
	expect(getProp(deepObj, "b" as any)).toBe(undefined);
	expect(getProp(deepObj, "deep", "b" as any)).toBe(undefined);
	expect(getProp(deepObj, "deep", "deeper", "b" as any)).toBe(undefined);
});
