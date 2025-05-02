import { describe, expect, test } from "bun:test";
import { RequiredError, getBytes, requireBytes } from "../index.js";

describe("getBytes()", () => {
	test("returns Uint8Array from ArrayBuffer", () => {
		const buf = new Uint8Array([1, 2, 3]);
		const result = getBytes(buf.buffer);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result!)).toEqual([1, 2, 3]);
	});
	test("returns Uint8Array from TypedArray", () => {
		const arr = new Uint16Array([256, 512]);
		const result = getBytes(arr);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result!.byteLength).toBe(arr.byteLength);
	});

	test("returns Uint8Array from string", () => {
		const str = "abc";
		const result = getBytes(str);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result!)).toEqual([97, 98, 99]);
	});

	test("returns Uint8Array from number", () => {
		const num = 42;
		const result = getBytes(num);
		expect(result).toBeInstanceOf(Uint8Array);
		// Float64Array encoding of 42
		const expected = new Uint8Array(new Float64Array([42]).buffer);
		expect(Array.from(result!)).toEqual(Array.from(expected));
	});

	test("returns Uint8Array([1]) from true", () => {
		const result = getBytes(true);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result!)).toEqual([1]);
	});

	test("returns Uint8Array([0]) from false", () => {
		const result = getBytes(false);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result!)).toEqual([0]);
	});

	test("returns Uint8Array([]) from null", () => {
		const result = getBytes(null);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result!)).toEqual([]);
	});

	test("returns Uint8Array([]) from undefined", () => {
		const result = getBytes(undefined);
		expect(result).toBeInstanceOf(Uint8Array);
		expect(Array.from(result!)).toEqual([]);
	});

	test("returns undefined for unsupported types (object)", () => {
		const result = getBytes({ foo: "bar" });
		expect(result).toBeUndefined();
	});

	test("returns undefined for unsupported types (array)", () => {
		const result = getBytes([1, 2, 3]);
		expect(result).toBeUndefined();
	});

	test("returns undefined for unsupported types (function)", () => {
		const result = getBytes(() => 123);
		expect(result).toBeUndefined();
	});
});

describe("requireBytes()", () => {
	test("returns Uint8Array for supported types", () => {
		expect(requireBytes(Buffer.from([1]))).toBeInstanceOf(Uint8Array);
		expect(requireBytes(new Uint8Array([2]))).toBeInstanceOf(Uint8Array);
		expect(requireBytes("x")).toBeInstanceOf(Uint8Array);
		expect(requireBytes(1)).toBeInstanceOf(Uint8Array);
		expect(requireBytes(true)).toBeInstanceOf(Uint8Array);
		expect(requireBytes(false)).toBeInstanceOf(Uint8Array);
		expect(requireBytes(null)).toBeInstanceOf(Uint8Array);
		expect(requireBytes(undefined)).toBeInstanceOf(Uint8Array);
	});

	test("throws RequiredError for unsupported types (object)", () => {
		expect(() => requireBytes({})).toThrow(RequiredError);
	});

	test("throws RequiredError for unsupported types (array)", () => {
		expect(() => requireBytes([1, 2, 3])).toThrow(RequiredError);
	});

	test("throws RequiredError for unsupported types (function)", () => {
		expect(() => requireBytes(() => 1)).toThrow(RequiredError);
	});
});
