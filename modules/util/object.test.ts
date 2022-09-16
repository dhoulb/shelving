import { ImmutableDictionary, isObject, MutableDictionary, deleteDictionaryItems, setDictionaryItem, setDictionaryItems, omitProps, withDictionaryItem, withProps, pickProps, getProp } from "../index.js";

const maplikeObj: ImmutableDictionary<number> = { a: 1, b: 2, c: 3, d: 4 };

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

test("withProp()", () => {
	// Prop is set (existing prop).
	expect(withDictionaryItem(maplikeObj, "d", 4444)).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(withDictionaryItem(maplikeObj, "d", 4444)).not.toBe(maplikeObj);
	// Prop is set (new prop).
	expect(withDictionaryItem(maplikeObj, "NEW", 1111)).toEqual({ a: 1, b: 2, c: 3, d: 4, NEW: 1111 });
	expect(withDictionaryItem(maplikeObj, "NEW", 1111)).not.toBe(maplikeObj);
	// If prop isn't changed same instance is returned.
	expect(withDictionaryItem(maplikeObj, "d", 4)).toBe(maplikeObj);
});
test("setProp()", () => {
	const obj1 = { a: 1, b: 2 };
	setDictionaryItem(obj1, "b", 2222);
	expect(obj1).toEqual({ a: 1, b: 2222 });
});
test("setProps()", () => {
	const obj1 = { a: 1, b: 2, c: 3 };
	setDictionaryItems(obj1, { b: 2222, c: 3333 });
	expect(obj1).toEqual({ a: 1, b: 2222, c: 3333 });
});
test("withProp()", () => {
	const obj: ImmutableDictionary<number> = { a: 1 };
	expect(withDictionaryItem(obj, "b", 2)).toEqual({ a: 1, b: 2 });
	expect(withDictionaryItem(obj, "b", 2)).not.toBe(obj);
	expect(withDictionaryItem(obj, "a", 1)).toBe(obj);
});
test("withProps()", () => {
	const obj: ImmutableDictionary<number> = { a: 1 };
	expect(withProps(obj, { b: 2 })).toEqual({ a: 1, b: 2 });
	expect(withProps(obj, { b: 2 })).not.toBe(obj);
	expect(withProps(obj, { a: 1 })).toBe(obj);
});
test("omitProps()", () => {
	const obj1: ImmutableDictionary<number> = { a: 1, b: 2 };
	expect(omitProps(obj1, "b")).toEqual({ a: 1 });
	expect(omitProps(obj1, "b")).not.toBe(obj1);
	const obj2 = { a: 1, b: 2, c: 3 } as const;
	const omit1: { b: 2; c: 3 } = omitProps(obj2, "a");
	expect(omit1).toEqual({ b: 2, c: 3 });
	const omit2: { c: 3 } = omitProps(obj2, "a", "b");
	expect(omit2).toEqual({ c: 3 });
	const omit3: Record<never, never> = omitProps(obj2, "a", "b", "c");
	expect(omit3).toEqual({});
	const obj3: ImmutableDictionary<number> = { a: 1, b: 2 };
	expect(omitProps(obj3, "c")).toBe(obj3);
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
test("setProp()", () => {
	const obj: MutableDictionary<number> = { a: 1 };
	setDictionaryItem(obj, "b", 2);
	expect(obj).toEqual({ a: 1, b: 2 });
});
test("setProps()", () => {
	const obj: MutableDictionary<number> = { a: 1 };
	setDictionaryItems(obj, { b: 2, c: 3 });
	expect(obj).toEqual({ a: 1, b: 2, c: 3 });
});
test("deleteProps()", () => {
	const obj1: MutableDictionary<number> = { a: 1, b: 2, c: 3 };
	deleteDictionaryItems(obj1, "b");
	expect(obj1).toEqual({ a: 1, c: 3 });
	const obj2: MutableDictionary<number> = { a: 1, b: 2, c: 3 };
	deleteDictionaryItems(obj2, "b", "c");
	expect(obj2).toEqual({ a: 1 });
});
