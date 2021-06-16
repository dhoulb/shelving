import { deepDiff, deepDiffArray, deepDiffObject, EQUAL } from "..";

const arrFlat = [1, "b", true, false, null];
const arrFlatSame = [1, "b", true, false, null];
const arrFlatExtra = [1, "b", true, false, null, "MYSTERY"];
const arrFlatMissing = [1, "b", true, false];
const arrFlatShuffle = [true, 1, false, null, "b"];
const arrFlatEmpty: string[] = [];

const objFlat = { a: 1, b: "C", c: true, d: false, e: null };
const objFlatSame = { a: 1, b: "C", c: true, d: false, e: null };
const objFlatExtra = { a: 1, b: "C", c: true, d: false, e: null, f: "MYSTERY" };
const objFlatMissing = { a: 1, b: "C", c: true, d: false };
const objFlatEmpty = {};

const arrDeep = [arrFlat, { a: 1, b: "b", c: objFlat }];
const arrDeepSame = [arrFlatSame, { a: 1, b: "b", c: objFlat }];
const arrDeepExtra = [arrFlatSame, { a: 1, b: "b", c: objFlat, d: true }];
const arrDeepMissing = [arrFlatSame, { a: 1 }];

const objDeep = { obj1: objFlat, obj2: { a: 1, b: "b" } };
const objDeepSame = { obj1: objFlat, obj2: { a: 1, b: "b" } };
const objDeepExtra = { obj1: objFlat, obj2: { a: 1, b: "b", c: "MYSTERY" } };
const objDeepMissing = { obj1: objFlat, obj2: { a: 1 } };

describe("deepDiff()", () => {
	test("deepDiff(): Diff equal simple values", () => {
		// Equal, so `EQUAL` constant is always returned.
		expect(deepDiff("abc", "abc")).toBe(EQUAL);
		expect(deepDiff(123, 123)).toBe(EQUAL);
		expect(deepDiff(true, true)).toBe(EQUAL);
		expect(deepDiff(false, false)).toBe(EQUAL);
		expect(deepDiff(null, null)).toBe(EQUAL);
	});
	test("deepDiff(): Diff unequal simple values", () => {
		// Different, so `right` value is always returned.
		expect(deepDiff(123, "123")).toBe("123");
		expect(deepDiff("123", 123)).toBe(123);
		expect(deepDiff(false, true)).toBe(true);
		expect(deepDiff(true, false)).toBe(false);
	});
	test("deepDiff(): Diff equal array values", () => {
		// Equal, so `EQUAL` constant is always returned.
		expect(deepDiff(arrFlat, arrFlat)).toBe(EQUAL);
		expect(deepDiff(arrFlat, arrFlatSame)).toBe(EQUAL);
		expect(deepDiff(arrFlat, arrFlat)).toBe(EQUAL);
		expect(deepDiff(arrFlat, arrFlatSame)).toBe(EQUAL);
		expect(deepDiff(arrDeep, arrDeep)).toBe(EQUAL);
		expect(deepDiff(arrDeep, arrDeepSame)).toBe(EQUAL);
		expect(deepDiff(arrFlatEmpty, [])).toBe(EQUAL);
		expect(deepDiff([], arrFlatEmpty)).toBe(EQUAL);
	});
	test("deepDiff(): Diff unequal array values", () => {
		// Different, so exact `right` instance is always returned.
		// DH: Currently arrays don't diff at an item level, they return the entire new array if not deeply equal.
		expect(deepDiff(arrFlat, arrFlatExtra)).toBe(arrFlatExtra);
		expect(deepDiff(arrFlatExtra, arrFlat)).toBe(arrFlat);
		expect(deepDiff(arrFlat, arrFlatMissing)).toBe(arrFlatMissing);
		expect(deepDiff(arrFlatMissing, arrFlat)).toBe(arrFlat);
		expect(deepDiff(arrFlat, arrFlatEmpty)).toBe(arrFlatEmpty);
		expect(deepDiff(arrFlatEmpty, arrFlat)).toBe(arrFlat);
		expect(deepDiff(arrDeep, arrDeepExtra)).toBe(arrDeepExtra);
		expect(deepDiff(arrDeepExtra, arrDeep)).toBe(arrDeep);
		expect(deepDiff(arrFlat, arrFlatShuffle)).toBe(arrFlatShuffle);
		expect(deepDiff(arrFlatShuffle, arrFlat)).toBe(arrFlat);
		expect(deepDiff(arrDeep, arrDeepMissing)).toBe(arrDeepMissing);
		expect(deepDiff(arrDeepMissing, arrDeep)).toBe(arrDeep);
	});
	test("deepDiff(): Diff equal object values", () => {
		// Equal, so `EQUAL` constant is always returned.
		expect(deepDiff(objFlat, objFlat)).toBe(EQUAL);
		expect(deepDiff(objFlat, objFlatSame)).toBe(EQUAL);
		expect(deepDiff(objFlat, objFlat)).toBe(EQUAL);
		expect(deepDiff(objFlat, objFlatSame)).toBe(EQUAL);
		expect(deepDiff(objDeep, objDeep)).toBe(EQUAL);
		expect(deepDiff(objDeep, objDeepSame)).toBe(EQUAL);
		expect(deepDiff(objFlatEmpty, {})).toBe(EQUAL);
		expect(deepDiff({}, objFlatEmpty)).toBe(EQUAL);
	});
	test("deepDiff(): Diff unequal object values", () => {
		// Different, so exact `right` instance is always returned.
		// DH: Currently object diff doesn't flag properties that have been deleted from `right`
		expect(deepDiff(objFlat, objFlatExtra)).toEqual({ f: "MYSTERY" });
		expect(deepDiff(objFlatExtra, objFlat)).toEqual({ f: undefined });
		expect(deepDiff(objFlat, objFlatMissing)).toEqual({ e: undefined });
		expect(deepDiff(objFlatMissing, objFlat)).toEqual({ e: null });
		expect(deepDiff(objFlat, objFlatEmpty)).toEqual({ a: undefined, b: undefined, c: undefined, d: undefined, e: undefined });
		expect(deepDiff(objFlatEmpty, objFlat)).toBe(objFlat);
		expect(deepDiff(objDeep, objDeepExtra)).toEqual({ obj2: { c: "MYSTERY" } });
		expect(deepDiff(objDeepExtra, objDeep)).toEqual({ obj2: { c: undefined } });
		expect(deepDiff(objDeep, objDeepMissing)).toEqual({ obj2: { b: undefined } });
		expect(deepDiff(objDeepMissing, objDeep)).toEqual({ obj2: { b: "b" } });
	});
	test("deepDiff(): Diff unequal mixed simple/object values", () => {
		// Different, so exact `right` instance is always returned.
		expect(deepDiff(arrFlat, 123)).toBe(123);
		expect(deepDiff(123, arrFlat)).toBe(arrFlat);
		expect(deepDiff(arrFlat, 123)).toBe(123);
		expect(deepDiff(123, arrFlat)).toBe(arrFlat);
		expect(deepDiff(objFlat, arrFlat)).toBe(arrFlat);
		expect(deepDiff(arrFlat, objFlat)).toBe(objFlat);
	});
	test("deepDiff(): Arrays and objects are not equal (even if contents are equal)", () => {
		// Different, so exact `right` instance is always returned.
		const arr = [0, 1, 2, 3];
		const obj = { ...arr };
		expect(deepDiff(arr, obj)).toBe(obj);
		expect(deepDiff(obj, arr)).toBe(arr);
	});
});
describe("deepDiffArray()", () => {
	test("deepDiffArray(): Diff equal array values", () => {
		// Equal, so `EQUAL` constant is always returned.
		expect(deepDiffArray(arrFlat, arrFlat)).toBe(EQUAL);
		expect(deepDiffArray(arrFlat, arrFlatSame)).toBe(EQUAL);
		expect(deepDiffArray(arrFlat, arrFlat)).toBe(EQUAL);
		expect(deepDiffArray(arrFlat, arrFlatSame)).toBe(EQUAL);
		expect(deepDiffArray(arrDeep, arrDeep)).toBe(EQUAL);
		expect(deepDiffArray(arrDeep, arrDeepSame)).toBe(EQUAL);
		expect(deepDiffArray(arrFlatEmpty, [])).toBe(EQUAL);
		expect(deepDiffArray([], arrFlatEmpty)).toBe(EQUAL);
	});
	test("deepDiffArray(): Diff unequal array values", () => {
		// Different, so exact `right` instance is always returned.
		// DH: Currently arrays don't diff at an item level, they return the entire new array if not deeply equal.
		expect(deepDiffArray(arrFlat, arrFlatExtra)).toBe(arrFlatExtra);
		expect(deepDiffArray(arrFlatExtra, arrFlat)).toBe(arrFlat);
		expect(deepDiffArray(arrFlat, arrFlatMissing)).toBe(arrFlatMissing);
		expect(deepDiffArray(arrFlatMissing, arrFlat)).toBe(arrFlat);
		expect(deepDiffArray(arrFlat, arrFlatEmpty)).toBe(arrFlatEmpty);
		expect(deepDiffArray(arrFlatEmpty, arrFlat)).toBe(arrFlat);
		expect(deepDiffArray(arrDeep, arrDeepExtra)).toBe(arrDeepExtra);
		expect(deepDiffArray(arrDeepExtra, arrDeep)).toBe(arrDeep);
		expect(deepDiffArray(arrFlat, arrFlatShuffle)).toBe(arrFlatShuffle);
		expect(deepDiffArray(arrFlatShuffle, arrFlat)).toBe(arrFlat);
		expect(deepDiffArray(arrDeep, arrDeepMissing)).toBe(arrDeepMissing);
		expect(deepDiffArray(arrDeepMissing, arrDeep)).toBe(arrDeep);
	});
});
describe("deepDiffObject()", () => {
	test("deepDiffObject(): Diff equal object values", () => {
		// Equal, so `EQUAL` constant is always returned.
		expect(deepDiffObject(objFlat, objFlat)).toBe(EQUAL);
		expect(deepDiffObject(objFlat, objFlatSame)).toBe(EQUAL);
		expect(deepDiffObject(objFlat, objFlat)).toBe(EQUAL);
		expect(deepDiffObject(objFlat, objFlatSame)).toBe(EQUAL);
		expect(deepDiffObject(objDeep, objDeep)).toBe(EQUAL);
		expect(deepDiffObject(objDeep, objDeepSame)).toBe(EQUAL);
		expect(deepDiffObject(objFlatEmpty, {})).toBe(EQUAL);
		expect(deepDiffObject({}, objFlatEmpty)).toBe(EQUAL);
	});
	test("deepDiffObject(): Diff unequal object values", () => {
		// Different, so exact `right` instance is always returned.
		expect(deepDiffObject(objFlat, objFlatExtra)).toEqual({ f: "MYSTERY" });
		expect(deepDiffObject(objFlatExtra, objFlat)).toEqual({ f: undefined });
		expect(deepDiffObject(objFlat, objFlatMissing)).toEqual({ e: undefined });
		expect(deepDiffObject(objFlatMissing, objFlat)).toEqual({ e: null });
		expect(deepDiffObject(objFlat, objFlatEmpty)).toEqual({ a: undefined, b: undefined, c: undefined, d: undefined, e: undefined });
		expect(deepDiffObject(objFlatEmpty, objFlat)).toBe(objFlat);
		expect(deepDiffObject(objDeep, objDeepExtra)).toEqual({ obj2: { c: "MYSTERY" } });
		expect(deepDiffObject(objDeepExtra, objDeep)).toEqual({ obj2: { c: undefined } });
		expect(deepDiffObject(objDeep, objDeepMissing)).toEqual({ obj2: { b: undefined } });
		expect(deepDiffObject(objDeepMissing, objDeep)).toEqual({ obj2: { b: "b" } });
	});
});
