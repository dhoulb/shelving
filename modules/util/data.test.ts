import { getProp, omitProps, pickProps } from "../index.js";

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
test("pickProps()", () => {
	const obj = { a: 1, b: 2, c: 3 } as const;
	const pick1: { a: 1 } = pickProps(obj, "a");
	expect(pick1).toEqual({ a: 1 });
	const pick2: { a: 1; b: 2 } = pickProps(obj, "a", "b");
	expect(pick2).toEqual({ a: 1, b: 2 });
	const pick3: { a: 1; b: 2; c: 3 } = pickProps(obj, "a", "b", "c");
	expect(pick3).toEqual(obj);
});
test("omitProps()", () => {
	const obj = { a: 1, b: 2, c: 3 } as const;
	const omit1: { b: 2; c: 3 } = omitProps(obj, "a");
	expect(omit1).toEqual({ b: 2, c: 3 });
	const omit2: { c: 3 } = omitProps(obj, "a", "b");
	expect(omit2).toEqual({ c: 3 });
	const omit3: Record<never, never> = omitProps(obj, "a", "b", "c");
	expect(omit3).toEqual({});
});
