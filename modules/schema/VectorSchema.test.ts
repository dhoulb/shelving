import { describe, expect, test } from "bun:test";
import { type Schema, VECTOR, VectorSchema } from "shelving/schema";
import type { VectorArray } from "shelving/util/vector";

describe("VectorSchema", () => {
	test("accepts a Float32Array of the size", () => {
		const v = new Float32Array([0.5, -0.5]);
		expect(VECTOR(2).validate(v)).toBe(v);
	});
	test("coerces an array of numbers", () => {
		expect(VECTOR(2).validate([0.5, -0.5])).toEqual(new Float32Array([0.5, -0.5]));
	});
	test("coerces the JSON form of a Float32Array", () => {
		const v = new Float32Array([0.1, 0.2, 0.3]);
		expect(VECTOR(3).validate(JSON.parse(JSON.stringify(v)))).toEqual(v);
	});
	test("defaults to zeros", () => {
		expect(VECTOR(3).validate(undefined)).toEqual(new Float32Array(3));
	});
	test("throws for the wrong size", () => {
		try {
			VECTOR(3).validate([1, 2]);
			expect.unreachable();
		} catch (thrown) {
			expect(thrown).toBe("Must be vector with 3 numbers");
		}
	});
	test("throws for other values", () => {
		expect(() => VECTOR(1).validate("a")).toThrow();
		expect(() => VECTOR(1).validate([Number.NaN])).toThrow();
	});
	test("formats as the number of numbers", () => {
		expect(new VectorSchema({ size: 2 }).format(new Float32Array(2))).toBe("2 numbers");
	});
	test("TypeScript", () => {
		const s1: Schema<VectorArray> = VECTOR(2);
		const r1: VectorArray = s1.validate([1, 2]);
		expect(r1.length).toBe(2);
	});
});

test("gives a new copy of the default each time", () => {
	const schema = VECTOR(2);
	const a = schema.validate(undefined);
	a[0] = 1;
	expect(schema.validate(undefined)).toEqual(new Float32Array(2));
});
