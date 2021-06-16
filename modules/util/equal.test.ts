import { isExactlyEqual, isDeepEqual, isArrayEqual, isObjectEqual } from "..";

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
const arrDeepDifferent = [arrFlatSame, { a: 1, b: "DIFFERENT", c: objFlat }];
const arrDeepExtra = [arrFlatSame, { a: 1, b: "b", c: objFlat, d: true }];
const arrDeepMissing = [arrFlatSame, { a: 1 }];

const objDeep = { obj1: objFlat, obj2: { a: 1, b: "b" } };
const objDeepSame = { obj1: objFlat, obj2: { a: 1, b: "b" } };
const objDeepDifferent = { obj1: objFlat, obj2: { a: 1, b: "DIFFERENT" } };
const objDeepExtra = { obj1: objFlat, obj2: { a: 1, b: "b", c: "MYSTERY" } };
const objDeepMissing = { obj1: objFlat, obj2: { a: 1 } };

describe("isEqual()", () => {
	test("isEqual(): Equal values", () => {
		expect(isExactlyEqual("abc", "abc")).toBe(true);
		expect(isExactlyEqual(123, 123)).toBe(true);
		expect(isExactlyEqual(true, true)).toBe(true);
		expect(isExactlyEqual(false, false)).toBe(true);
		expect(isExactlyEqual(null, null)).toBe(true);
		expect(isExactlyEqual(arrFlatEmpty, arrFlatEmpty)).toBe(true);
		expect(isExactlyEqual(objFlatEmpty, objFlatEmpty)).toBe(true);
	});
	test("isEqual() Unequal values", () => {
		expect(isExactlyEqual("123", 123)).toBe(false);
		expect(isExactlyEqual(123, "123")).toBe(false);
		expect(isExactlyEqual(true, 1)).toBe(false);
		expect(isExactlyEqual(1, true)).toBe(false);
		expect(isExactlyEqual(false, 0)).toBe(false);
		expect(isExactlyEqual(0, false)).toBe(false);
		expect(isExactlyEqual([], [])).toBe(false);
		expect(isExactlyEqual({}, {})).toBe(false);
	});
});
describe("isDeepEqual()", () => {
	test("isDeepEqual(): Equal simple values", () => {
		expect(isDeepEqual("abc", "abc")).toBe(true);
		expect(isDeepEqual(123, 123)).toBe(true);
		expect(isDeepEqual(true, true)).toBe(true);
		expect(isDeepEqual(false, false)).toBe(true);
		expect(isDeepEqual(null, null)).toBe(true);
	});
	test("isDeepEqual(): Unequal simple values", () => {
		expect(isDeepEqual(123, "123")).toBe(false);
		expect(isDeepEqual("123", 123)).toBe(false);
		expect(isDeepEqual(false, true)).toBe(false);
		expect(isDeepEqual(true, false)).toBe(false);
	});
	test("isDeepEqual(): Unequal mixed simple/object values", () => {
		expect(isDeepEqual(arrFlat, 123)).toBe(false);
		expect(isDeepEqual(123, arrFlat)).toBe(false);
		expect(isDeepEqual(arrFlat, 123)).toBe(false);
		expect(isDeepEqual(123, arrFlat)).toBe(false);
		expect(isDeepEqual(objFlat, arrFlat)).toBe(false);
		expect(isDeepEqual(arrFlat, objFlat)).toBe(false);
	});
	test("isDeepEqual(): Arrays and objects are not equal (even if contents are equal)", () => {
		const arr = [0, 1, 2, 3];
		const obj = { ...arr };
		expect(isDeepEqual(arr, obj)).toBe(false);
		expect(isDeepEqual(obj, arr)).toBe(false);
	});
	test("isDeepEqual(): Equal array values", () => {
		expect(isDeepEqual(arrFlat, arrFlat)).toBe(true);
		expect(isDeepEqual(arrFlat, arrFlatSame)).toBe(true);
		expect(isDeepEqual(arrFlat, arrFlat)).toBe(true);
		expect(isDeepEqual(arrFlat, arrFlatSame)).toBe(true);
		expect(isDeepEqual(arrDeep, arrDeep)).toBe(true);
		expect(isDeepEqual(arrDeep, arrDeepSame)).toBe(true);
		expect(isDeepEqual(arrFlatEmpty, [])).toBe(true);
		expect(isDeepEqual([], arrFlatEmpty)).toBe(true);
	});
	test("isDeepEqual(): Unequal array values", () => {
		expect(isDeepEqual(arrFlat, arrFlatExtra)).toBe(false);
		expect(isDeepEqual(arrFlatExtra, arrFlat)).toBe(false);
		expect(isDeepEqual(arrFlat, arrFlatMissing)).toBe(false);
		expect(isDeepEqual(arrFlatMissing, arrFlat)).toBe(false);
		expect(isDeepEqual(arrFlat, arrFlatEmpty)).toBe(false);
		expect(isDeepEqual(arrFlatEmpty, arrFlat)).toBe(false);
		expect(isDeepEqual(arrDeep, arrDeepExtra)).toBe(false);
		expect(isDeepEqual(arrDeepExtra, arrDeep)).toBe(false);
		expect(isDeepEqual(arrFlat, arrFlatShuffle)).toBe(false);
		expect(isDeepEqual(arrFlatShuffle, arrFlat)).toBe(false);
		expect(isDeepEqual(arrDeep, arrDeepMissing)).toBe(false);
		expect(isDeepEqual(arrDeepMissing, arrDeep)).toBe(false);
	});
	test("isDeepEqual(): Equal object values", () => {
		expect(isDeepEqual(objFlat, objFlat)).toBe(true);
		expect(isDeepEqual(objFlat, objFlatSame)).toBe(true);
		expect(isDeepEqual(objFlat, objFlat)).toBe(true);
		expect(isDeepEqual(objFlat, objFlatSame)).toBe(true);
		expect(isDeepEqual(objDeep, objDeep)).toBe(true);
		expect(isDeepEqual(objDeep, objDeepSame)).toBe(true);
		expect(isDeepEqual(objFlatEmpty, {})).toBe(true);
		expect(isDeepEqual({}, objFlatEmpty)).toBe(true);
	});
	test("isDeepEqual(): Unequal object values", () => {
		expect(isDeepEqual(objFlat, objFlatExtra)).toEqual(false);
		expect(isDeepEqual(objFlatExtra, objFlat)).toBe(false);
		expect(isDeepEqual(objFlat, objFlatMissing)).toBe(false);
		expect(isDeepEqual(objFlatMissing, objFlat)).toBe(false);
		expect(isDeepEqual(objFlat, objFlatEmpty)).toBe(false);
		expect(isDeepEqual(objFlatEmpty, objFlat)).toBe(false);
		expect(isDeepEqual(objDeep, objDeepExtra)).toEqual(false);
		expect(isDeepEqual(objDeepExtra, objDeep)).toBe(false);
		expect(isDeepEqual(objDeep, objDeepMissing)).toBe(false);
		expect(isDeepEqual(objDeepMissing, objDeep)).toEqual(false);
	});
});
describe("isArrayEqual()", () => {
	test("isArrayEqual(): Equal array values", () => {
		expect(isArrayEqual(arrFlat, arrFlat)).toBe(true);
		expect(isArrayEqual(arrFlat, arrFlatSame)).toBe(true);
		expect(isArrayEqual(arrFlat, arrFlat)).toBe(true);
		expect(isArrayEqual(arrFlat, arrFlatSame)).toBe(true);
		expect(isArrayEqual(arrDeep, arrDeep)).toBe(true);
		expect(isArrayEqual(arrFlatEmpty, [])).toBe(true);
		expect(isArrayEqual([], arrFlatEmpty)).toBe(true);
		expect(isArrayEqual(arrDeep, arrDeep, isDeepEqual)).toBe(true);
		expect(isArrayEqual(arrDeep, arrDeepSame, isDeepEqual)).toBe(true);
		expect(isArrayEqual(arrDeepSame, arrDeep, isDeepEqual)).toBe(true);
	});
	test("isArrayEqual(): Unequal array values", () => {
		expect(isArrayEqual(arrFlat, arrFlatExtra)).toBe(false);
		expect(isArrayEqual(arrFlatExtra, arrFlat)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatMissing)).toBe(false);
		expect(isArrayEqual(arrFlatMissing, arrFlat)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatEmpty)).toBe(false);
		expect(isArrayEqual(arrFlatEmpty, arrFlat)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepSame)).toBe(false);
		expect(isArrayEqual(arrDeepSame, arrDeep)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepDifferent)).toBe(false);
		expect(isArrayEqual(arrDeepDifferent, arrDeep)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepExtra)).toBe(false);
		expect(isArrayEqual(arrDeepExtra, arrDeep)).toBe(false);
		expect(isArrayEqual(arrDeepExtra, arrDeep)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatShuffle)).toBe(false);
		expect(isArrayEqual(arrFlatShuffle, arrFlat)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepMissing)).toBe(false);
		expect(isArrayEqual(arrDeepMissing, arrDeep)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatExtra, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlatExtra, arrFlat, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatMissing, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlatMissing, arrFlat, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatEmpty, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlatEmpty, arrFlat, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepDifferent, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeepDifferent, arrDeep, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepExtra, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeepExtra, arrDeep, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeepExtra, arrDeep, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlat, arrFlatShuffle, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrFlatShuffle, arrFlat, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeep, arrDeepMissing, isDeepEqual)).toBe(false);
		expect(isArrayEqual(arrDeepMissing, arrDeep, isDeepEqual)).toBe(false);
	});
});
describe("isObjectEqual()", () => {
	test("isObjectEqual(): Equal object values", () => {
		expect(isObjectEqual(objFlat, objFlat)).toBe(true);
		expect(isObjectEqual(objFlat, objFlatSame)).toBe(true);
		expect(isObjectEqual(objFlat, objFlat)).toBe(true);
		expect(isObjectEqual(objFlat, objFlatSame)).toBe(true);
		expect(isObjectEqual(objDeep, objDeep)).toBe(true);
		expect(isObjectEqual(objFlatEmpty, {})).toBe(true);
		expect(isObjectEqual({}, objFlatEmpty)).toBe(true);
		expect(isObjectEqual(objDeep, objDeep, isDeepEqual)).toBe(true);
		expect(isObjectEqual(objDeep, objDeepSame, isDeepEqual)).toBe(true);
		expect(isObjectEqual(objDeepSame, objDeep, isDeepEqual)).toBe(true);
	});
	test("isObjectEqual(): Unequal object values", () => {
		expect(isObjectEqual(objFlat, objFlatExtra)).toEqual(false);
		expect(isObjectEqual(objFlatExtra, objFlat)).toBe(false);
		expect(isObjectEqual(objFlat, objFlatMissing)).toBe(false);
		expect(isObjectEqual(objFlatMissing, objFlat)).toBe(false);
		expect(isObjectEqual(objFlat, objFlatEmpty)).toBe(false);
		expect(isObjectEqual(objFlatEmpty, objFlat)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepSame)).toBe(false);
		expect(isObjectEqual(objDeepSame, objDeep)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepDifferent)).toBe(false);
		expect(isObjectEqual(objDeepDifferent, objDeep)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepExtra)).toEqual(false);
		expect(isObjectEqual(objDeepExtra, objDeep)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepMissing)).toBe(false);
		expect(isObjectEqual(objDeepMissing, objDeep)).toEqual(false);
		expect(isObjectEqual(objFlat, objFlatExtra, isDeepEqual)).toEqual(false);
		expect(isObjectEqual(objFlatExtra, objFlat, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objFlat, objFlatMissing, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objFlatMissing, objFlat, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objFlat, objFlatEmpty, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objFlatEmpty, objFlat, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepDifferent, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objDeepDifferent, objDeep, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepExtra, isDeepEqual)).toEqual(false);
		expect(isObjectEqual(objDeepExtra, objDeep, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objDeep, objDeepMissing, isDeepEqual)).toBe(false);
		expect(isObjectEqual(objDeepMissing, objDeep, isDeepEqual)).toEqual(false);
	});
});
