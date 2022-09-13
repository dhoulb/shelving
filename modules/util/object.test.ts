import { ImmutableObject, isObject, MutableObject, deleteObjectProps, setObjectProp, setObjectProps, withoutObjectProps, withObjectProp, withObjectProps, pickObjectProps, getObjectProp } from "../index.js";

const maplikeObj: ImmutableObject<number> = { a: 1, b: 2, c: 3, d: 4 };

test("isObject()", () => {
	// Yes.
	expect(isObject({})).toEqual(true);
	expect(isObject(Object.create(null))).toEqual(true);
	expect(isObject(new Date())).toEqual(true);
	expect(isObject([])).toEqual(true);
	// No.
	expect(isObject("a")).toEqual(false);
	expect(isObject(true)).toEqual(false);
	expect(isObject(false)).toEqual(false);
	expect(isObject(123)).toEqual(false);
});
test("getProp()", () => {
	const testObj = { a: "A", 1: 1 };
	const deepObj = { ...testObj, deep: { ...testObj, deeper: { ...testObj } } };
	// Works correctly.
	expect(getObjectProp(deepObj, "a")).toBe("A");
	expect(getObjectProp(deepObj, 1)).toBe(1);
	expect(getObjectProp(deepObj, "deep", "a")).toBe("A");
	expect(getObjectProp(deepObj, "deep", 1)).toBe(1);
	expect(getObjectProp(deepObj, "deep", "deeper", "a")).toBe("A");
	expect(getObjectProp(deepObj, "deep", "deeper", 1)).toBe(1);
	// Works correctly for not found values.
	expect(getObjectProp(deepObj, "b" as any)).toBe(undefined);
	expect(getObjectProp(deepObj, "deep", "b" as any)).toBe(undefined);
	expect(getObjectProp(deepObj, "deep", "deeper", "b" as any)).toBe(undefined);
});

test("withProp()", () => {
	// Prop is set (existing prop).
	expect(withObjectProp(maplikeObj, "d", 4444)).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(withObjectProp(maplikeObj, "d", 4444)).not.toBe(maplikeObj);
	// Prop is set (new prop).
	expect(withObjectProp(maplikeObj, "NEW", 1111)).toEqual({ a: 1, b: 2, c: 3, d: 4, NEW: 1111 });
	expect(withObjectProp(maplikeObj, "NEW", 1111)).not.toBe(maplikeObj);
	// If prop isn't changed same instance is returned.
	expect(withObjectProp(maplikeObj, "d", 4)).toBe(maplikeObj);
});
test("setProp()", () => {
	const obj1 = { a: 1, b: 2 };
	setObjectProp(obj1, "b", 2222);
	expect(obj1).toEqual({ a: 1, b: 2222 });
});
test("setProps()", () => {
	const obj1 = { a: 1, b: 2, c: 3 };
	setObjectProps(obj1, { b: 2222, c: 3333 });
	expect(obj1).toEqual({ a: 1, b: 2222, c: 3333 });
});
test("withProp()", () => {
	const obj: ImmutableObject<number> = { a: 1 };
	expect(withObjectProp(obj, "b", 2)).toEqual({ a: 1, b: 2 });
	expect(withObjectProp(obj, "b", 2)).not.toBe(obj);
	expect(withObjectProp(obj, "a", 1)).toBe(obj);
});
test("withProps()", () => {
	const obj: ImmutableObject<number> = { a: 1 };
	expect(withObjectProps(obj, { b: 2 })).toEqual({ a: 1, b: 2 });
	expect(withObjectProps(obj, { b: 2 })).not.toBe(obj);
	expect(withObjectProps(obj, { a: 1 })).toBe(obj);
});
test("withoutProps()", () => {
	const obj1: ImmutableObject<number> = { a: 1, b: 2 };
	expect(withoutObjectProps(obj1, "b")).toEqual({ a: 1 });
	expect(withoutObjectProps(obj1, "b")).not.toBe(obj1);
	const obj2 = { a: 1, b: 2, c: 3 } as const;
	const omit1: { b: 2; c: 3 } = withoutObjectProps(obj2, "a");
	expect(omit1).toEqual({ b: 2, c: 3 });
	const omit2: { c: 3 } = withoutObjectProps(obj2, "a", "b");
	expect(omit2).toEqual({ c: 3 });
	const omit3: Record<never, never> = withoutObjectProps(obj2, "a", "b", "c");
	expect(omit3).toEqual({});
	const obj3: ImmutableObject<number> = { a: 1, b: 2 };
	expect(withoutObjectProps(obj3, "c")).toBe(obj3);
});
test("pickProps()", () => {
	const obj = { a: 1, b: 2, c: 3 } as const;
	const pick1: { a: 1 } = pickObjectProps(obj, "a");
	expect(pick1).toEqual({ a: 1 });
	const pick2: { a: 1; b: 2 } = pickObjectProps(obj, "a", "b");
	expect(pick2).toEqual({ a: 1, b: 2 });
	const pick3: { a: 1; b: 2; c: 3 } = pickObjectProps(obj, "a", "b", "c");
	expect(pick3).toEqual(obj);
});
test("setProp()", () => {
	const obj: MutableObject<number> = { a: 1 };
	setObjectProp(obj, "b", 2);
	expect(obj).toEqual({ a: 1, b: 2 });
});
test("setProps()", () => {
	const obj: MutableObject<number> = { a: 1 };
	setObjectProps(obj, { b: 2, c: 3 });
	expect(obj).toEqual({ a: 1, b: 2, c: 3 });
});
test("deleteProps()", () => {
	const obj1: MutableObject<number> = { a: 1, b: 2, c: 3 };
	deleteObjectProps(obj1, "b");
	expect(obj1).toEqual({ a: 1, c: 3 });
	const obj2: MutableObject<number> = { a: 1, b: 2, c: 3 };
	deleteObjectProps(obj2, "b", "c");
	expect(obj2).toEqual({ a: 1 });
});
