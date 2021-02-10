import { shallowMerge, deepMerge, mergeArray, mergeObject } from "..";
import { ImmutableArray } from "../array";

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

const objDeep = { obj1: objFlat, obj2: { a: 1, b: "b" } };
const objDeepSame = { obj1: objFlat, obj2: { a: 1, b: "b" } };
const objDeepExtra = { obj1: objFlat, obj2: { a: 1, b: "b", c: "MYSTERY" } };
const objDeepMissing = { obj1: objFlat, obj2: { a: 1 } };

describe("shallowMerge()", () => {
	test("shallowMerge(): Exact objects", () => {
		// Shallow.
		expect(shallowMerge(objFlat, objFlat)).toBe(objFlat);
		expect(shallowMerge(objFlat, objFlatSame)).toBe(objFlat);
		expect(shallowMerge(objFlatSame, objFlat)).toBe(objFlatSame);
		expect(shallowMerge(objFlatExtra, objFlat)).toBe(objFlatExtra);
		expect(shallowMerge(objFlat, objFlatMissing)).toBe(objFlat);
		expect(shallowMerge(objFlat, objFlatEmpty)).toBe(objFlat);
	});
	test("shallowMerge(): Equal objects", () => {
		expect(shallowMerge(objFlat, objFlatExtra)).toEqual(objFlatExtra);
		expect(shallowMerge(objFlatMissing, objFlat)).toEqual(objFlat);
		expect(shallowMerge(objFlatEmpty, objFlat)).toEqual(objFlat);
		expect(mergeObject({ a: 1, b: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
		expect(mergeObject({ a: 1 }, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		expect(mergeObject({ a: 1, b: 1 }, { b: 2, c: 2 })).toEqual({ a: 1, b: 2, c: 2 });
		expect(mergeObject({}, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
	});
	test("shallowMerge(): Arrays/objects are not compared (if contents are equal)", () => {
		expect(shallowMerge(objFlat, arrFlat)).toBe(arrFlat);
		expect(shallowMerge(arrFlat, objFlat)).toBe(objFlat);
		// Mergeerent, so exact `right` instance is always returned.
		const arr = [0, 1, 2, 3];
		const obj = { ...arr };
		expect(shallowMerge(arr, obj)).toBe(obj);
		expect(shallowMerge(obj, arr)).toBe(arr);
	});
});
describe("deepMerge()", () => {
	test("deepMerge(): Types", () => {
		// Normal types.
		const ddd: string = deepMerge(123, "abc");
		const eee: ImmutableArray<string | number> = deepMerge([1, 2], ["a", "b"]);
		const aaa: { a: number; b: string } = deepMerge({ a: 1 }, { b: "two" });
		// @ts-expect-error
		const fff: number = deepMerge(123, "abc");
		// @ts-expect-error
		const ggg: ImmutableArray<number> = deepMerge([1, 2], ["a", "b"]);
		// @ts-expect-error
		const nnn: { a: string; b: string } = deepMerge({ a: 1 }, { b: "two" });

		// Object types.
		const jjj: { a: number; b: number } = deepMerge({ a: 1 }, { b: 2 });
		const kkk: { a: number } = deepMerge({ a: 1 }, { a: 1 });
		const lll: { a: string } = deepMerge({ a: 1 }, { a: "a" });
	});
	test("deepMerge(): Exact simple values", () => {
		expect(deepMerge("abc", "abc")).toBe("abc");
		expect(deepMerge(123, 123)).toBe(123);
		expect(deepMerge(true, true)).toBe(true);
		expect(deepMerge(false, false)).toBe(false);
		expect(deepMerge(null, null)).toBe(null);
		expect(deepMerge(123, "abc")).toBe("abc");
		expect(deepMerge("abc", 123)).toBe(123);
		expect(deepMerge(false, true)).toBe(true);
		expect(deepMerge(true, false)).toBe(false);
	});
	test("deepMerge(): Exact arrays", () => {
		// Equal, so exact `left` instance is returned.
		expect(deepMerge(arrFlat, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatSame)).toBe(arrFlat);
		expect(deepMerge(arrFlatSame, arrFlat)).toBe(arrFlatSame);
		// Different, so exact `right` instance is returned.
		expect(deepMerge(arrFlatExtra, arrFlat)).toBe(arrFlatExtra);
		expect(deepMerge(arrFlat, arrFlatMissing)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatShuffle)).toBe(arrFlat);
		expect(deepMerge(arrFlatShuffle, arrFlat)).toBe(arrFlatShuffle);
		expect(deepMerge(arrFlat, arrFlatEmpty)).toBe(arrFlat);
	});
	test("deepMerge(): Equal arrays", () => {
		expect(deepMerge(arrFlat, arrFlatExtra)).toEqual(arrFlatExtra);
		expect(deepMerge(arrFlatMissing, arrFlat)).toEqual(arrFlat);
		expect(deepMerge(arrFlatEmpty, arrFlat)).toEqual(arrFlat);
		expect(mergeArray([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
		expect(mergeArray([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4]);
	});
	test("deepMerge(): Exact objects", () => {
		// Shallow.
		expect(deepMerge(objFlat, objFlat)).toBe(objFlat);
		expect(deepMerge(objFlat, objFlatSame)).toBe(objFlat);
		expect(deepMerge(objFlatSame, objFlat)).toBe(objFlatSame);
		expect(deepMerge(objDeep, objDeepSame)).toBe(objDeep);
		expect(deepMerge(objDeepSame, objDeep)).toBe(objDeepSame);
		expect(deepMerge(objFlatExtra, objFlat)).toBe(objFlatExtra);
		expect(deepMerge(objFlat, objFlatMissing)).toBe(objFlat);
		expect(deepMerge(objFlat, objFlatEmpty)).toBe(objFlat);
		// Deep.
		expect(deepMerge(objDeepExtra, objDeep)).toBe(objDeepExtra);
		expect(deepMerge(objDeep, objDeepMissing)).toBe(objDeep);
	});
	test("deepMerge(): Equal objects", () => {
		// Shallow.
		expect(deepMerge(objFlat, objFlatExtra)).toEqual(objFlatExtra);
		expect(deepMerge(objFlatMissing, objFlat)).toEqual(objFlat);
		expect(deepMerge(objFlatEmpty, objFlat)).toEqual(objFlat);
		expect(deepMerge({ a: 1, b: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
		expect(deepMerge({ a: 1 }, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		expect(deepMerge({ a: 1, b: 1 }, { b: 2, c: 2 })).toEqual({ a: 1, b: 2, c: 2 });
		expect(deepMerge({}, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		// Deep.
		expect(deepMerge(objDeep, objDeepExtra)).toEqual(objDeepExtra);
		expect(deepMerge(objDeepMissing, objDeep)).toEqual(objDeep);
		expect(deepMerge({ deep: { a: 1 } }, { deep: { b: 2 } })).toEqual({ deep: { a: 1, b: 2 } });
	});
	test("deepMerge(): Arrays/objects are not compared (if contents are equal)", () => {
		expect(deepMerge(objFlat, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, objFlat)).toBe(objFlat);
		// Mergeerent, so exact `right` instance is always returned.
		const arr = [0, 1, 2, 3];
		const obj = { ...arr };
		expect(deepMerge(arr, obj)).toBe(obj);
		expect(deepMerge(obj, arr)).toBe(arr);
	});
});
describe("mergeArray()", () => {
	test("mergeArray(): Exact arrays", () => {
		expect(mergeArray(arrFlat, arrFlat)).toBe(arrFlat);
		expect(mergeArray(arrFlat, arrFlatSame)).toBe(arrFlat);
		expect(mergeArray(arrFlatSame, arrFlat)).toBe(arrFlatSame);
		expect(mergeArray(arrFlatExtra, arrFlat)).toBe(arrFlatExtra);
		expect(mergeArray(arrFlat, arrFlatMissing)).toBe(arrFlat);
		expect(mergeArray(arrFlat, arrFlatShuffle)).toBe(arrFlat);
		expect(mergeArray(arrFlatShuffle, arrFlat)).toBe(arrFlatShuffle);
		expect(mergeArray(arrFlat, arrFlatEmpty)).toBe(arrFlat);
		expect(mergeArray(arrFlat, [1, 1, 1, 1])).toBe(arrFlat);
	});
	test("mergeArray(): Equal arrays", () => {
		expect(mergeArray(arrFlat, arrFlatExtra)).toEqual(arrFlatExtra);
		expect(mergeArray(arrFlatMissing, arrFlat)).toEqual(arrFlat);
		expect(mergeArray(arrFlatEmpty, arrFlat)).toEqual(arrFlat);
		expect(mergeArray([1, 2, 3], [4, 5, 6])).toEqual([1, 2, 3, 4, 5, 6]);
		expect(mergeArray([1, 2, 3], [2, 3, 4])).toEqual([1, 2, 3, 4]);
	});
});
describe("mergeObject()", () => {
	test("mergeObject(): Types", () => {
		const aaa: { a: number; b: number } = mergeObject({ a: 1 }, { b: 2 });
		const bbb: { a: number } = mergeObject({ a: 1 }, { a: 1 });
		const ccc: { a: string; b: number } = mergeObject({ a: 1, b: 2 }, { a: "a" });
	});
	test("mergeObject(): Exact objects", () => {
		// Shallow.
		expect(mergeObject(objFlat, objFlat)).toBe(objFlat);
		expect(mergeObject(objFlat, objFlatSame)).toBe(objFlat);
		expect(mergeObject(objFlatSame, objFlat)).toBe(objFlatSame);
		expect(mergeObject(objFlatExtra, objFlat)).toBe(objFlatExtra);
		expect(mergeObject(objFlat, objFlatMissing)).toBe(objFlat);
		expect(mergeObject(objFlat, objFlatEmpty)).toBe(objFlat);
		// Deep.
		expect(mergeObject(objDeepExtra, objDeep, deepMerge)).toBe(objDeepExtra);
		expect(mergeObject(objDeep, objDeepMissing, deepMerge)).toBe(objDeep);
	});
	test("mergeObject(): Merge unequal object values", () => {
		// Shallow.
		expect(mergeObject(objFlat, objFlatExtra)).toEqual(objFlatExtra);
		expect(mergeObject(objFlatMissing, objFlat)).toEqual(objFlat);
		expect(mergeObject(objFlatEmpty, objFlat)).toEqual(objFlat);
		expect(mergeObject({ a: 1, b: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
		expect(mergeObject({ a: 1 }, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		expect(mergeObject({ a: 1, b: 1 }, { b: 2, c: 2 })).toEqual({ a: 1, b: 2, c: 2 });
		expect(mergeObject({}, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		// Deep.
		expect(mergeObject(objDeep, objDeepExtra, deepMerge)).toEqual(objDeepExtra);
		expect(mergeObject(objDeepMissing, objDeep, deepMerge)).toEqual(objDeep);
		expect(mergeObject({ deep: { a: 1 } }, { deep: { b: 2 } }, deepMerge)).toEqual({ deep: { a: 1, b: 2 } });
	});
});
