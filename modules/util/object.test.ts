import {
	SKIP,
	mapProps,
	objectFromKeys,
	withoutEntry,
	withProp,
	setProp,
	getProp,
	objectFromEntries,
	isObject,
	mapKeys,
	ImmutableEntries,
	ImmutableObject,
	setProps,
	withEntry,
} from "..";
import { addEntries, addEntry, MutableObject, removeEntries, removeEntry, withEntries } from "./object";

const fixedObj = { a: 1, b: "B", c: true };
const maplikeObj: ImmutableObject<number> = { a: 1, b: 2, c: 3, d: 4 };
const maplikeEntries: ImmutableEntries<number> = Object.entries(maplikeObj);
const maplikeKeys: ReadonlyArray<string> = Object.keys(maplikeObj);

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
	expect(objectFromEntries(Object.entries(maplikeObj))).toEqual(maplikeObj);
	expect(objectFromEntries(Object.entries(maplikeObj))).not.toBe(maplikeObj);
	expect(objectFromEntries(maplikeEntries)).toEqual(maplikeObj);
	expect(objectFromEntries(maplikeEntries)).not.toBe(maplikeEntries);
});
test("mapProps()", async () => {
	// Square each number (input is object).
	expect(mapProps(maplikeObj, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	expect(mapProps(maplikeObj, n => n * n)).not.toBe(maplikeObj);
	// Square each number (input is entries).
	expect(mapProps(maplikeEntries, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	expect(mapProps(maplikeEntries, n => n * n)).not.toBe(maplikeEntries);
	// Works with promises (input is object).
	expect(mapProps(maplikeObj, n => Promise.resolve(n * n))).toBeInstanceOf(Promise);
	expect(await mapProps(maplikeObj, n => Promise.resolve(n * n))).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	// Works with promises (input is entries).
	expect(mapProps(maplikeEntries, n => Promise.resolve(n * n))).toBeInstanceOf(Promise);
	expect(await mapProps(maplikeEntries, n => Promise.resolve(n * n))).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	// Use SKIP to skip odd numbers (input is object).
	expect(mapProps(maplikeObj, n => (n % 2 ? n : SKIP))).toEqual({ a: 1, c: 3 });
	expect(mapProps(maplikeObj, n => (n % 2 ? n : SKIP))).not.toBe(maplikeObj);
	// Use SKIP to skip odd numbers (input is entries).
	expect(mapProps(maplikeEntries, n => (n % 2 ? n : SKIP))).toEqual({ a: 1, c: 3 });
	expect(mapProps(maplikeEntries, n => (n % 2 ? n : SKIP))).not.toBe(maplikeEntries);
	// Use a flat value instead of a mapper function (input is object).
	expect(mapProps(maplikeObj, null)).toEqual({ a: null, b: null, c: null, d: null });
	expect(mapProps(maplikeObj, null)).not.toBe(maplikeObj);
	// Use a flat value instead of a mapper function (input is entries).
	expect(mapProps(maplikeEntries, null)).toEqual({ a: null, b: null, c: null, d: null });
	expect(mapProps(maplikeEntries, null)).not.toBe(maplikeEntries);
	// Return same instance if no numbers changed.
	expect(mapProps(maplikeObj, n => n)).toBe(maplikeObj);
});
test("mapKeys()", () => {
	// Square each number (input is object).
	expect(mapKeys(maplikeObj, k => k.toUpperCase())).toEqual({ A: 1, B: 2, C: 3, D: 4 });
	expect(mapKeys(maplikeObj, k => k.toUpperCase())).not.toBe(maplikeObj);
	// Square each number (input is entries).
	expect(mapKeys(maplikeEntries, k => k.toUpperCase())).toEqual({ A: 1, B: 2, C: 3, D: 4 });
	expect(mapKeys(maplikeEntries, k => k.toUpperCase())).not.toBe(maplikeEntries);
	// Use SKIP to skip odd numbers (input is object).
	expect(mapKeys(maplikeObj, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).toEqual({ A: 1, C: 3 });
	expect(mapKeys(maplikeObj, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).not.toBe(maplikeObj);
	// Use SKIP to skip odd numbers (input is object).
	expect(mapKeys(maplikeEntries, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).toEqual({ A: 1, C: 3 });
	expect(mapKeys(maplikeEntries, (k, n) => (n % 2 ? k.toUpperCase() : SKIP))).not.toBe(maplikeObj);
	// Return same instance if no keys changed.
	expect(mapKeys(maplikeObj, k => k)).toBe(maplikeObj);
});
test("objectFromKeys()", async () => {
	// Square each number.
	expect(objectFromKeys(maplikeKeys, k => k.toUpperCase())).toEqual({ a: "A", b: "B", c: "C", d: "D" });
	expect(objectFromKeys(maplikeKeys, k => k.toUpperCase())).not.toBe(maplikeObj);
	// Works with promises.
	expect(objectFromKeys(maplikeKeys, k => Promise.resolve(k.toUpperCase()))).toBeInstanceOf(Promise);
	expect(await objectFromKeys(maplikeKeys, k => Promise.resolve(k.toUpperCase()))).toEqual({ a: "A", b: "B", c: "C", d: "D" });
	// Use SKIP to skip some keys..
	expect(objectFromKeys(maplikeKeys, k => (k === "b" || k === "d" ? SKIP : 123))).toEqual({ a: 123, c: 123 });
	expect(objectFromKeys(maplikeKeys, k => (k === "b" || k === "d" ? SKIP : 123))).not.toBe(maplikeObj);
	// Use a flat value instead of a mapper function.
	expect(objectFromKeys(maplikeKeys, null)).toEqual({ a: null, b: null, c: null, d: null });
	expect(objectFromKeys(maplikeKeys, null)).not.toBe(maplikeObj);
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
test("withProp()", () => {
	// Prop is set (existing prop).
	expect(withProp(maplikeObj, "d", 4444)).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(withProp(maplikeObj, "d", 4444)).not.toBe(maplikeObj);
	// Prop is set (new prop).
	expect(withProp(maplikeObj, "NEW", 1111)).toEqual({ a: 1, b: 2, c: 3, d: 4, NEW: 1111 });
	expect(withProp(maplikeObj, "NEW", 1111)).not.toBe(maplikeObj);
	// If prop isn't changed same instance is returned.
	expect(withProp(maplikeObj, "d", 4)).toBe(maplikeObj);
});
test("setProp()", () => {
	const obj1 = { a: 1, b: 2 };
	setProp(obj1, "b", 2222);
	expect(obj1).toEqual({ a: 1, b: 2222 });
});
test("setProps()", () => {
	const obj1 = { a: 1, b: 2, c: 3 };
	setProps(obj1, { b: 2222, c: 3333 });
	expect(obj1).toEqual({ a: 1, b: 2222, c: 3333 });
});
test("withEntry()", () => {
	const obj: ImmutableObject<number> = { a: 1 };
	expect(withEntry(obj, "b", 2)).toEqual({ a: 1, b: 2 });
	expect(withEntry(obj, "b", 2)).not.toBe(obj);
	expect(withEntry(obj, "a", 1)).toBe(obj);
});
test("withEntries()", () => {
	const obj: ImmutableObject<number> = { a: 1 };
	expect(withEntries(obj, { b: 2 })).toEqual({ a: 1, b: 2 });
	expect(withEntries(obj, { b: 2 })).not.toBe(obj);
	expect(withEntries(obj, { a: 1 })).toBe(obj);
});
test("withoutEntry()", () => {
	const obj: ImmutableObject<number> = { a: 1, b: 2 };
	expect(withoutEntry(obj, "b")).toEqual({ a: 1 });
	expect(withoutEntry(obj, "b")).not.toBe(obj);
	expect(withoutEntry(obj, "c")).toBe(obj);
});
test("addEntry()", () => {
	const obj: MutableObject<number> = { a: 1 };
	addEntry(obj, "b", 2);
	expect(obj).toEqual({ a: 1, b: 2 });
});
test("addEntries()", () => {
	const obj: MutableObject<number> = { a: 1 };
	addEntries(obj, { b: 2, c: 3 });
	expect(obj).toEqual({ a: 1, b: 2, c: 3 });
});
test("removeEntry()", () => {
	const obj: MutableObject<number> = { a: 1, b: 2 };
	removeEntry(obj, "b", 2);
	expect(obj).toEqual({ a: 1 });
});
test("removeEntries()", () => {
	const obj: MutableObject<number> = { a: 1, b: 2, c: 3 };
	removeEntries(obj, ["b", "c"]);
	expect(obj).toEqual({ a: 1 });
});
