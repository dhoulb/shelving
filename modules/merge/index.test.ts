import { deepMerge, deepMergeArray, deepMergeObject } from "..";

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

describe("deepMerge()", () => {
	test("deepMerge(): Types", () => {
		// Normal types.
		const ddd: string = deepMerge(123, "abc");
		const eee: string[] = deepMerge([1, 2], ["a", "b"]);
		// @ts-expect-error
		const fff: number = deepMerge(123, "abc");
		// @ts-expect-error
		const ggg: number[] = deepMerge([1, 2], ["a", "b"]);

		// Object types.
		const jjj: { a: number; b: number } = deepMerge({ a: 1 }, { b: 2 });
		const kkk: { a: number } = deepMerge({ a: 1 }, { a: 1 });
		const lll: { a: string } = deepMerge({ a: 1 }, { a: "a" });
	});
	test("deepMerge(): Merge equal simple values", () => {
		expect(deepMerge("abc", "abc")).toBe("abc");
		expect(deepMerge(123, 123)).toBe(123);
		expect(deepMerge(true, true)).toBe(true);
		expect(deepMerge(false, false)).toBe(false);
		expect(deepMerge(null, null)).toBe(null);
	});
	test("deepMerge(): Merge unequal simple values", () => {
		expect(deepMerge(123, "abc")).toBe("abc");
		expect(deepMerge("abc", 123)).toBe(123);
		expect(deepMerge(false, true)).toBe(true);
		expect(deepMerge(true, false)).toBe(false);
	});
	test("deepMerge(): Merge equal array values", () => {
		// Equal, so exact `left` instance is returned.
		expect(deepMerge(arrFlat, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatSame)).toBe(arrFlat);
		expect(deepMerge(arrFlatSame, arrFlat)).toBe(arrFlatSame);
		expect(deepMerge(arrDeep, arrDeepSame)).toBe(arrDeep);
		expect(deepMerge(arrDeepSame, arrDeep)).toBe(arrDeepSame);
	});
	test("deepMerge(): Merge unequal array values", () => {
		// Different, so exact `right` instance is returned.
		// DH: Currently arrays don't merge at an item level, they return the entire new array if not deeply equal.
		expect(deepMerge(arrFlat, arrFlatExtra)).toBe(arrFlatExtra);
		expect(deepMerge(arrFlatExtra, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatExtra)).toBe(arrFlatExtra);
		expect(deepMerge(arrFlatExtra, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatMissing)).toBe(arrFlatMissing);
		expect(deepMerge(arrFlatMissing, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatShuffle)).toBe(arrFlatShuffle);
		expect(deepMerge(arrFlatShuffle, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, arrFlatEmpty)).toBe(arrFlatEmpty);
		expect(deepMerge(arrFlatEmpty, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrDeep, arrDeepExtra)).toBe(arrDeepExtra);
		expect(deepMerge(arrDeepExtra, arrDeep)).toBe(arrDeep);
		expect(deepMerge(arrDeep, arrDeepExtra)).toBe(arrDeepExtra);
		expect(deepMerge(arrDeepExtra, arrDeep)).toBe(arrDeep);
		expect(deepMerge(arrDeep, arrDeepMissing)).toBe(arrDeepMissing);
		expect(deepMerge(arrDeepMissing, arrDeep)).toBe(arrDeep);
	});
	test("deepMerge(): Merge equal object values", () => {
		// Equal, so exact `left` instance is returned.
		expect(deepMerge(objFlat, objFlat)).toBe(objFlat);
		expect(deepMerge(objFlat, objFlatSame)).toBe(objFlat);
		expect(deepMerge(objFlatSame, objFlat)).toBe(objFlatSame);
		expect(deepMerge(objDeep, objDeepSame)).toBe(objDeep);
		expect(deepMerge(objDeepSame, objDeep)).toBe(objDeepSame);
	});
	test("deepMerge(): Merge unequal object values", () => {
		// Different, so merged value is returned.
		expect(deepMerge(objFlat, objFlatExtra)).toBe(objFlatExtra);
		expect(deepMerge(objFlatExtra, objFlat)).toBe(objFlatExtra);
		expect(deepMerge(objFlat, objFlatMissing)).toBe(objFlat);
		expect(deepMerge(objFlatMissing, objFlat)).toBe(objFlat);
		expect(deepMerge(objFlat, objFlatEmpty)).toBe(objFlat);
		expect(deepMerge(objFlatEmpty, objFlat)).toBe(objFlat);
		expect(deepMerge(objDeep, objDeepExtra)).toBe(objDeepExtra);
		expect(deepMerge(objDeepExtra, objDeep)).toBe(objDeepExtra);
		expect(deepMerge(objDeep, objDeepExtra)).toBe(objDeepExtra);
		expect(deepMerge(objDeepMissing, objDeep)).toBe(objDeep);
		expect(deepMerge(objDeep, objDeepMissing)).toBe(objDeep);
		expect(deepMerge({ a: 1, b: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
		expect(deepMerge({ a: 1 }, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		expect(deepMerge({ a: 1, b: 1 }, { b: 2, c: 2 })).toEqual({ a: 1, b: 2, c: 2 });
		expect(deepMerge({}, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
	});
	test("deepMerge(): Merge unequal mixed simple/object values", () => {
		// Mergeerent, so exact `right` instance is always returned.
		expect(deepMerge(objFlat, arrFlat)).toBe(arrFlat);
		expect(deepMerge(arrFlat, objFlat)).toBe(objFlat);
	});
	test("deepMerge(): Arrays and objects are not equal (even if contents are equal)", () => {
		// Mergeerent, so exact `right` instance is always returned.
		const arr = [0, 1, 2, 3];
		const obj = { ...arr };
		expect(deepMerge(arr, obj)).toBe(obj);
		expect(deepMerge(obj, arr)).toBe(arr);
	});
});
describe("deepMergeArray()", () => {
	test("deepMergeArray(): Merge equal array values", () => {
		// Equal, so exact `left` instance is returned.
		expect(deepMergeArray(arrFlat, arrFlat)).toBe(arrFlat);
		expect(deepMergeArray(arrFlat, arrFlatSame)).toBe(arrFlat);
		expect(deepMergeArray(arrFlatSame, arrFlat)).toBe(arrFlatSame);
		expect(deepMergeArray(arrDeep, arrDeepSame)).toBe(arrDeep);
		expect(deepMergeArray(arrDeepSame, arrDeep)).toBe(arrDeepSame);
	});
	test("deepMergeArray(): Merge unequal array values", () => {
		// Different, so exact `right` instance is returned.
		// DH: Currently arrays don't merge at an item level, they return the entire new array if not deeply equal.
		expect(deepMergeArray(arrFlat, arrFlatExtra)).toBe(arrFlatExtra);
		expect(deepMergeArray(arrFlatExtra, arrFlat)).toBe(arrFlat);
		expect(deepMergeArray(arrFlat, arrFlatExtra)).toBe(arrFlatExtra);
		expect(deepMergeArray(arrFlatExtra, arrFlat)).toBe(arrFlat);
		expect(deepMergeArray(arrFlat, arrFlatMissing)).toBe(arrFlatMissing);
		expect(deepMergeArray(arrFlatMissing, arrFlat)).toBe(arrFlat);
		expect(deepMergeArray(arrFlat, arrFlatShuffle)).toBe(arrFlatShuffle);
		expect(deepMergeArray(arrFlatShuffle, arrFlat)).toBe(arrFlat);
		expect(deepMergeArray(arrFlat, arrFlatEmpty)).toBe(arrFlatEmpty);
		expect(deepMergeArray(arrFlatEmpty, arrFlat)).toBe(arrFlat);
		expect(deepMergeArray(arrDeep, arrDeepExtra)).toBe(arrDeepExtra);
		expect(deepMergeArray(arrDeepExtra, arrDeep)).toBe(arrDeep);
		expect(deepMergeArray(arrDeep, arrDeepExtra)).toBe(arrDeepExtra);
		expect(deepMergeArray(arrDeepExtra, arrDeep)).toBe(arrDeep);
		expect(deepMergeArray(arrDeep, arrDeepMissing)).toBe(arrDeepMissing);
		expect(deepMergeArray(arrDeepMissing, arrDeep)).toBe(arrDeep);
	});
});
describe("deepMergeObject()", () => {
	test("deepMergeObject(): Types", () => {
		const aaa: { a: number; b: number } = deepMergeObject({ a: 1 }, { b: 2 });
		const bbb: { a: number } = deepMergeObject({ a: 1 }, { a: 1 });
		const ccc: { a: string; b: number } = deepMergeObject({ a: 1, b: 2 }, { a: "a" });
	});
	test("deepMergeObject(): Merge equal object values", () => {
		// Equal, so exact `left` instance is returned.
		expect(deepMergeObject(objFlat, objFlat)).toBe(objFlat);
		expect(deepMergeObject(objFlat, objFlatSame)).toBe(objFlat);
		expect(deepMergeObject(objFlatSame, objFlat)).toBe(objFlatSame);
		expect(deepMergeObject(objDeep, objDeepSame)).toBe(objDeep);
		expect(deepMergeObject(objDeepSame, objDeep)).toBe(objDeepSame);
	});
	test("deepMergeObject(): Merge unequal object values", () => {
		// Different, so merged value is returned.
		expect(deepMergeObject(objFlat, objFlatExtra)).toBe(objFlatExtra);
		expect(deepMergeObject(objFlatExtra, objFlat)).toBe(objFlatExtra);
		expect(deepMergeObject(objFlat, objFlatMissing)).toBe(objFlat);
		expect(deepMergeObject(objFlatMissing, objFlat)).toBe(objFlat);
		expect(deepMergeObject(objFlat, objFlatEmpty)).toBe(objFlat);
		expect(deepMergeObject(objFlatEmpty, objFlat)).toBe(objFlat);
		expect(deepMergeObject(objDeep, objDeepExtra)).toBe(objDeepExtra);
		expect(deepMergeObject(objDeepExtra, objDeep)).toBe(objDeepExtra);
		expect(deepMergeObject(objDeep, objDeepExtra)).toBe(objDeepExtra);
		expect(deepMergeObject(objDeepMissing, objDeep)).toBe(objDeep);
		expect(deepMergeObject(objDeep, objDeepMissing)).toBe(objDeep);
		expect(deepMergeObject({ a: 1, b: 1 }, { b: 2 })).toEqual({ a: 1, b: 2 });
		expect(deepMergeObject({ a: 1 }, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
		expect(deepMergeObject({ a: 1, b: 1 }, { b: 2, c: 2 })).toEqual({ a: 1, b: 2, c: 2 });
		expect(deepMergeObject({}, { a: 2, b: 2 })).toEqual({ a: 2, b: 2 });
	});
});
