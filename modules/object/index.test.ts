import {
	SKIP,
	mapProps,
	objectFromKeys,
	withoutProp,
	withProp,
	updateProp,
	getProp,
	objectFromEntries,
	isObject,
	mapKeys,
	ImmutableEntries,
	ImmutableObject,
	updateProps,
} from "..";

const obj: ImmutableObject<number> = { a: 1, b: 2, c: 3, d: 4 };
const entries: ImmutableEntries<number> = Object.entries(obj);
const keys: ReadonlyArray<string> = ["a", "b", "c", "d"];

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
test("objectFromEntries()", () => {
	expect(objectFromEntries(Object.entries(obj))).toEqual(obj);
	expect(objectFromEntries(Object.entries(obj))).not.toBe(obj);
	expect(objectFromEntries(entries)).toEqual(obj);
	expect(objectFromEntries(entries)).not.toBe(entries);
});
test("mapProps()", async () => {
	// Square each number (input is object).
	expect(mapProps(obj, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	expect(mapProps(obj, n => n * n)).not.toBe(obj);
	// Square each number (input is entries).
	expect(mapProps(entries, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	expect(mapProps(entries, n => n * n)).not.toBe(entries);
	// Works with promises (input is object).
	expect(mapProps(obj, n => Promise.resolve(n * n))).toBeInstanceOf(Promise);
	expect(await mapProps(obj, n => Promise.resolve(n * n))).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	// Works with promises (input is entries).
	expect(mapProps(entries, n => Promise.resolve(n * n))).toBeInstanceOf(Promise);
	expect(await mapProps(entries, n => Promise.resolve(n * n))).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	// Use SKIP to skip odd numbers (input is object).
	expect(mapProps(obj, n => (n % 2 ? n : SKIP))).toEqual({ a: 1, c: 3 });
	expect(mapProps(obj, n => (n % 2 ? n : SKIP))).not.toBe(obj);
	// Use SKIP to skip odd numbers (input is entries).
	expect(mapProps(entries, n => (n % 2 ? n : SKIP))).toEqual({ a: 1, c: 3 });
	expect(mapProps(entries, n => (n % 2 ? n : SKIP))).not.toBe(entries);
	// Use a flat value instead of a mapper function (input is object).
	expect(mapProps(obj, null)).toEqual({ a: null, b: null, c: null, d: null });
	expect(mapProps(obj, null)).not.toBe(obj);
	// Use a flat value instead of a mapper function (input is entries).
	expect(mapProps(entries, null)).toEqual({ a: null, b: null, c: null, d: null });
	expect(mapProps(entries, null)).not.toBe(entries);
	// Return same instance if no numbers changed.
	expect(mapProps(obj, n => n)).toBe(obj);
});
test("mapKeys()", () => {
	// Square each number (input is object).
	expect(mapKeys(obj, k => k.toUpperCase())).toEqual({ A: 1, B: 2, C: 3, D: 4 });
	expect(mapKeys(obj, k => k.toUpperCase())).not.toBe(obj);
	// Square each number (input is entries).
	expect(mapKeys(entries, k => k.toUpperCase())).toEqual({ A: 1, B: 2, C: 3, D: 4 });
	expect(mapKeys(entries, k => k.toUpperCase())).not.toBe(entries);
	// Use SKIP to skip odd numbers (input is object).
	expect(mapKeys(obj, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).toEqual({ A: 1, C: 3 });
	expect(mapKeys(obj, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).not.toBe(obj);
	// Use SKIP to skip odd numbers (input is object).
	expect(mapKeys(entries, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).toEqual({ A: 1, C: 3 });
	expect(mapKeys(entries, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).not.toBe(obj);
	// Return same instance if no keys changed.
	expect(mapKeys(obj, k => k)).toBe(obj);
});
test("objectFromKeys()", async () => {
	// Square each number.
	expect(objectFromKeys(keys, k => k.toUpperCase())).toEqual({ a: "A", b: "B", c: "C", d: "D" });
	expect(objectFromKeys(keys, k => k.toUpperCase())).not.toBe(obj);
	// Works with promises.
	expect(objectFromKeys(keys, k => Promise.resolve(k.toUpperCase()))).toBeInstanceOf(Promise);
	expect(await objectFromKeys(keys, k => Promise.resolve(k.toUpperCase()))).toEqual({ a: "A", b: "B", c: "C", d: "D" });
	// Use SKIP to skip some keys..
	expect(objectFromKeys(keys, k => (k === "b" || k === "d" ? SKIP : 123))).toEqual({ a: 123, c: 123 });
	expect(objectFromKeys(keys, k => (k === "b" || k === "d" ? SKIP : 123))).not.toBe(obj);
	// Use a flat value instead of a mapper function.
	expect(objectFromKeys(keys, null)).toEqual({ a: null, b: null, c: null, d: null });
	expect(objectFromKeys(keys, null)).not.toBe(obj);
});
test("withoutProp()", () => {
	// Prop is deleted.
	expect(withoutProp(obj, "c")).toEqual({ a: 1, b: 2, d: 4 });
	expect(withoutProp(obj, "c")).not.toBe(obj);
	// If prop isn't deleted same instance is returned.
	expect(withoutProp(obj, "NOPE" as any)).toBe(obj);
});
test("withProp()", () => {
	// Prop is set (existing prop).
	expect(withProp(obj, "d", 4444)).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(withProp(obj, "d", 4444)).not.toBe(obj);
	// Prop is set (new prop).
	expect(withProp(obj, "NEW", 1111)).toEqual({ a: 1, b: 2, c: 3, d: 4, NEW: 1111 });
	expect(withProp(obj, "NEW", 1111)).not.toBe(obj);
	// If prop isn't changed same instance is returned.
	expect(withProp(obj, "d", 4)).toBe(obj);
});
test("updateProp()", () => {
	// Prop is set (existing prop).
	expect(updateProp(obj, "d", 4444)).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(updateProp(obj, "d", 4444)).not.toBe(obj);
	// If prop isn't changed same instance is returned.
	expect(updateProp(obj, "d", 4)).toBe(obj);
});
test("updateProps()", () => {
	// Prop is set (existing prop).
	expect(updateProps(obj, { d: 4444 })).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(updateProps(obj, { d: 4444 })).not.toBe(obj);
	// If prop isn't changed same instance is returned.
	expect(updateProps(obj, { d: 4 })).toBe(obj);
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
	expect(getProp(deepObj, "b")).toBe(undefined);
	expect(getProp(deepObj, "deep", "b")).toBe(undefined);
	expect(getProp(deepObj, "deep", "deeper", "b")).toBe(undefined);
});
