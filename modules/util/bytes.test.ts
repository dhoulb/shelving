import { describe, expect, test } from "bun:test";
import { getBytes, RequiredError, requireBytes } from "../index.js";

describe("getBytes()", () => {
	test("returns Uint8Array from ArrayBuffer", () => {
		const result1 = getBytes(new Uint8Array([1, 2, 3]).buffer);
		expect(result1).toBeInstanceOf(Uint8Array);
		expect(result1).toEqual(new Uint8Array([1, 2, 3]));
	});
	test("returns Uint8Array from TypedArray", () => {
		const result2 = getBytes(new Uint8Array([1, 2, 3]));
		expect(result2).toBeInstanceOf(Uint8Array);
		expect(result2).toEqual(new Uint8Array([1, 2, 3]));
	});
	test("returns Uint8Array from string", () => {
		const result3 = getBytes("abc");
		expect(result3).toBeInstanceOf(Uint8Array);
		expect(result3).toEqual(new Uint8Array([97, 98, 99]));
		const result4 = getBytes("🎉");
		expect(result4).toBeInstanceOf(Uint8Array);
		expect(result4).toEqual(new Uint8Array([240, 159, 142, 137]));
	});
	test("returns undefined for unsupported types", () => {
		expect(getBytes({ foo: "bar" })).toBeUndefined();
		expect(getBytes([1, 2, 3])).toBeUndefined();
		expect(getBytes(() => 123)).toBeUndefined();
	});
});
describe("requireBytes()", () => {
	test("returns Uint8Array for supported types", () => {
		expect(requireBytes(new Uint8Array([2]))).toBeInstanceOf(Uint8Array);
		expect(requireBytes(new Uint8Array([2]).buffer)).toBeInstanceOf(Uint8Array);
		expect(requireBytes("x")).toBeInstanceOf(Uint8Array);
	});
	test("throws RequiredError for unsupported types", () => {
		expect(() => requireBytes(true as any)).toThrow(RequiredError);
		expect(() => requireBytes(false as any)).toThrow(RequiredError);
		expect(() => requireBytes(null as any)).toThrow(RequiredError);
		expect(() => requireBytes(undefined as any)).toThrow(RequiredError);
		expect(() => requireBytes({} as any)).toThrow(RequiredError);
		expect(() => requireBytes([1, 2, 3] as any)).toThrow(RequiredError);
		expect(() => requireBytes((() => 1) as any)).toThrow(RequiredError);
	});
});
