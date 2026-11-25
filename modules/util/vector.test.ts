import { describe, expect, test } from "bun:test";
import {
	assertVectorArray,
	getDotProduct,
	getScaledVector,
	getUnitVector,
	getVectorArray,
	getVectorLength,
	getWordVector,
	isVectorArray,
	mergeVectors,
	requireVectorArray,
	type VectorArray,
} from "shelving/util/vector";

describe("isVectorArray()", () => {
	test("accepts a Float32Array", () => {
		expect(isVectorArray(new Float32Array(3))).toBe(true);
		expect(isVectorArray(new Float32Array(3), 3)).toBe(true);
	});
	test("rejects the wrong size", () => {
		expect(isVectorArray(new Float32Array(3), 4)).toBe(false);
	});
	test("rejects other values", () => {
		expect(isVectorArray([1, 2, 3])).toBe(false);
		expect(isVectorArray(new Float64Array(3))).toBe(false);
		expect(isVectorArray(undefined)).toBe(false);
	});
});

describe("assertVectorArray()", () => {
	test("throws for other values", () => {
		expect(() => assertVectorArray([1], 1)).toThrow("Must be vector with 1 numbers");
		expect(() => assertVectorArray(new Float32Array(1), 1)).not.toThrow();
	});
});

describe("getVectorArray()", () => {
	test("returns a Float32Array as it is", () => {
		const v = new Float32Array([1, 2]);
		expect(getVectorArray(v)).toBe(v);
		expect(getVectorArray(v, 3)).toBeUndefined();
	});
	test("converts an array of numbers", () => {
		expect(getVectorArray([0.5, -0.5])).toEqual(new Float32Array([0.5, -0.5]));
		expect(getVectorArray([0.5, -0.5], 3)).toBeUndefined();
	});
	test("rejects arrays with values that are not finite numbers", () => {
		expect(getVectorArray([0.5, "a"])).toBeUndefined();
		expect(getVectorArray([0.5, Number.NaN])).toBeUndefined();
	});
	test("reads back what JSON.stringify() makes of a Float32Array", () => {
		const v = new Float32Array([0.1, -0.25, 0, 1 / 3]);
		const json = JSON.parse(JSON.stringify({ v })).v;
		expect(getVectorArray(json)).toEqual(v);
		expect(getVectorArray(json, 4)).toEqual(v);
	});
	test("rejects objects with other keys", () => {
		expect(getVectorArray({ "0": 1, "2": 2 })).toBeUndefined();
		expect(getVectorArray({ a: 1 })).toBeUndefined();
	});
	test("rejects other values", () => {
		expect(getVectorArray("abc")).toBeUndefined();
		expect(getVectorArray(123)).toBeUndefined();
		expect(getVectorArray(null)).toBeUndefined();
	});
});

describe("requireVectorArray()", () => {
	test("returns the vector", () => {
		expect(requireVectorArray([1, 2], 2)).toEqual(new Float32Array([1, 2]));
	});
	test("throws for other values", () => {
		expect(() => requireVectorArray("abc")).toThrow("Must be vector");
		expect(() => requireVectorArray([1], 2)).toThrow("Must be vector with 2 numbers");
	});
});

describe("getVectorLength()", () => {
	test("measures a vector", () => {
		expect(getVectorLength(new Float32Array([3, 4]))).toBe(5);
		expect(getVectorLength(new Float32Array(2))).toBe(0);
	});
});

describe("getUnitVector()", () => {
	test("scales to length 1", () => {
		const v = getUnitVector(new Float32Array([3, 4]));
		expect(v[0]).toBeCloseTo(0.6);
		expect(v[1]).toBeCloseTo(0.8);
		expect(getVectorLength(v)).toBeCloseTo(1);
	});
	test("returns all zeros as it is", () => {
		const v = new Float32Array(2);
		expect(getUnitVector(v)).toBe(v);
	});
});

describe("getScaledVector()", () => {
	test("multiplies every number", () => {
		expect(getScaledVector(new Float32Array([1, -2]), 0.5)).toEqual(new Float32Array([0.5, -1]));
	});
	test("returns the input for a weight of 1", () => {
		const v = new Float32Array([1, 2]);
		expect(getScaledVector(v, 1)).toBe(v);
	});
});

describe("mergeVectors()", () => {
	test("joins vectors and numbers in order", () => {
		expect(mergeVectors(new Float32Array([1, 2]), 3, new Float32Array([4]))).toEqual(new Float32Array([1, 2, 3, 4]));
	});
	test("dot product of joined vectors is the sum of the parts", () => {
		const a1 = new Float32Array([1, 2]);
		const a2 = new Float32Array([3]);
		const b1 = new Float32Array([4, 5]);
		const b2 = new Float32Array([6]);
		expect(getDotProduct(mergeVectors(a1, a2), mergeVectors(b1, b2))).toBe(getDotProduct(a1, b1) + getDotProduct(a2, b2));
	});
});

describe("getDotProduct()", () => {
	test("multiplies in pairs and sums", () => {
		expect(getDotProduct(new Float32Array([1, 2]), new Float32Array([3, 4]))).toBe(11);
	});
	test("counts missing numbers as zero", () => {
		expect(getDotProduct(new Float32Array([1, 2, 3]), new Float32Array([1]))).toBe(1);
	});
});

describe("getWordVector()", () => {
	const score = (a: string, b: string) => getDotProduct(getWordVector(a), getWordVector(b));
	test("gives a unit vector of the size", () => {
		const v: VectorArray = getWordVector("Hill repeats", 64);
		expect(v.length).toBe(64);
		expect(getVectorLength(v)).toBeCloseTo(1);
	});
	test("gives the same vector for the same text", () => {
		expect(getWordVector("Cool Dan")).toEqual(getWordVector("cool dan"));
	});
	test("gives all zeros for a text with no words", () => {
		expect(getVectorLength(getWordVector("!!!"))).toBe(0);
	});
	test("scores the same text as 1", () => {
		expect(score("cooldan", "cooldan")).toBeCloseTo(1);
	});
	test("scores shared words and word pieces higher than unrelated text", () => {
		expect(score("cool dan", "cooldan94")).toBeGreaterThan(score("cool dan", "mudlarks"));
		expect(score("houl", "Dave Houlbrooke")).toBeGreaterThan(score("houl", "Dan Cooper"));
		expect(score("runn", "running")).toBeGreaterThan(score("runn", "swimming"));
	});
});

test("TypeScript", () => {
	const v1: VectorArray = new Float32Array(2);
	const v2: VectorArray | undefined = getVectorArray([1, 2]);
	const v3: VectorArray = requireVectorArray(v1);
	expect([v1, v2, v3].length).toBe(3);
});
