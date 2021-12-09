import {
	ImmutableObject,
	isObject,
	MutableObject,
	deleteEntry,
	deleteEntries,
	setEntry,
	setEntries,
	withoutEntries,
	withEntry,
	withEntries,
} from "../index.js";

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
test("withEntry()", () => {
	// Prop is set (existing prop).
	expect(withEntry(maplikeObj, "d", 4444)).toEqual({ a: 1, b: 2, c: 3, d: 4444 });
	expect(withEntry(maplikeObj, "d", 4444)).not.toBe(maplikeObj);
	// Prop is set (new prop).
	expect(withEntry(maplikeObj, "NEW", 1111)).toEqual({ a: 1, b: 2, c: 3, d: 4, NEW: 1111 });
	expect(withEntry(maplikeObj, "NEW", 1111)).not.toBe(maplikeObj);
	// If prop isn't changed same instance is returned.
	expect(withEntry(maplikeObj, "d", 4)).toBe(maplikeObj);
});
test("setEntry()", () => {
	const obj1 = { a: 1, b: 2 };
	setEntry(obj1, "b", 2222);
	expect(obj1).toEqual({ a: 1, b: 2222 });
});
test("setEntries()", () => {
	const obj1 = { a: 1, b: 2, c: 3 };
	setEntries(obj1, { b: 2222, c: 3333 });
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
test("withoutEntries()", () => {
	const obj: ImmutableObject<number> = { a: 1, b: 2 };
	expect(withoutEntries(obj, "b")).toEqual({ a: 1 });
	expect(withoutEntries(obj, "b")).not.toBe(obj);
	expect(withoutEntries(obj, "c")).toBe(obj);
});
test("setEntry()", () => {
	const obj: MutableObject<number> = { a: 1 };
	setEntry(obj, "b", 2);
	expect(obj).toEqual({ a: 1, b: 2 });
});
test("setEntries()", () => {
	const obj: MutableObject<number> = { a: 1 };
	setEntries(obj, { b: 2, c: 3 });
	expect(obj).toEqual({ a: 1, b: 2, c: 3 });
});
test("deleteEntry()", () => {
	const obj: MutableObject<number> = { a: 1, b: 2 };
	deleteEntry(obj, "b", 2);
	expect(obj).toEqual({ a: 1 });
});
test("deleteEntries()", () => {
	const obj: MutableObject<number> = { a: 1, b: 2, c: 3 };
	deleteEntries(obj, ["b", "c"]);
	expect(obj).toEqual({ a: 1 });
});
