import { describe, expect, test } from "bun:test";
import {
	decodeBase64Bytes,
	decodeBase64String,
	decodeBase64UrlBytes,
	decodeBase64UrlString,
	encodeBase64,
	encodeBase64Url,
} from "../index.js";

describe("encodeBase64()", () => {
	test("should encode ASCII strings correctly", () => {
		expect(encodeBase64("f")).toBe("Zg==");
		expect(encodeBase64("fo")).toBe("Zm8=");
		expect(encodeBase64("foo")).toBe("Zm9v");
		expect(encodeBase64("foob")).toBe("Zm9vYg==");
		expect(encodeBase64("fooba")).toBe("Zm9vYmE=");
		expect(encodeBase64("foobar")).toBe("Zm9vYmFy");
	});
	test("should encode empty string to empty string", () => {
		expect(encodeBase64("")).toBe("");
	});
	test("should encode ArrayBuffer", () => {
		const buf = new Uint8Array([102, 111, 111]); // "foo"
		expect(encodeBase64(buf.buffer)).toBe("Zm9v");
	});
	test("should encode TypedArray", () => {
		const arr = new Uint8Array([98, 97, 114]); // "bar"
		expect(encodeBase64(arr)).toBe("YmFy");
	});
	test("should handle non-ASCII (UTF-8) input", () => {
		expect(encodeBase64("✓ à la mode")).toBe("4pyTIMOgIGxhIG1vZGU=");
		expect(encodeBase64("😅")).toBe("8J+YhQ==");
	});
});
describe("decodeBase64String()", () => {
	test("should decode Base64 string to correct string", () => {
		expect(decodeBase64String("Zg==")).toBe("f");
		expect(decodeBase64String("Zm8=")).toBe("fo");
		expect(decodeBase64String("Zm9v")).toBe("foo");
		expect(decodeBase64String("Zm9vYg==")).toBe("foob");
		expect(decodeBase64String("Zm9vYmE=")).toBe("fooba");
		expect(decodeBase64String("Zm9vYmFy")).toBe("foobar");
	});
	test("should decode empty string to empty string", () => {
		expect(decodeBase64String("")).toBe("");
	});
	test("should decode non-ASCII (UTF-8) Base64", () => {
		expect(decodeBase64String("4pyTIMOgIGxhIG1vZGU=")).toBe("✓ à la mode");
		expect(decodeBase64String("8J+YhQ==")).toBe("😅");
	});
});
describe("decodeBase64UrlBytes()", () => {
	test("should decode Base64URL string to correct bytes", () => {
		expect(Array.from(decodeBase64UrlBytes("Zg"))).toEqual([102]);
		expect(Array.from(decodeBase64UrlBytes("Zm8"))).toEqual([102, 111]);
		expect(Array.from(decodeBase64UrlBytes("Zm9v"))).toEqual([102, 111, 111]);
		expect(Array.from(decodeBase64UrlBytes("Zm9vYg"))).toEqual([102, 111, 111, 98]);
		expect(Array.from(decodeBase64UrlBytes("Zm9vYmE"))).toEqual([102, 111, 111, 98, 97]);
		expect(Array.from(decodeBase64UrlBytes("Zm9vYmFy"))).toEqual([102, 111, 111, 98, 97, 114]);
	});
	test("should decode empty string to empty Uint8Array", () => {
		expect(Array.from(decodeBase64UrlBytes(""))).toEqual([]);
	});
	test("should decode non-ASCII (UTF-8) Base64URL", () => {
		expect(Array.from(decodeBase64UrlBytes("4pyTIMOgIGxhIG1vZGU"))).toEqual(Array.from(new TextEncoder().encode("✓ à la mode")));
		expect(Array.from(decodeBase64UrlBytes("8J-YhQ"))).toEqual(Array.from(new TextEncoder().encode("😅")));
	});
});
describe("encodeBase64Url()", () => {
	test("should encode ASCII strings correctly", () => {
		expect(encodeBase64Url("f")).toBe("Zg");
		expect(encodeBase64Url("fo")).toBe("Zm8");
		expect(encodeBase64Url("foo")).toBe("Zm9v");
		expect(encodeBase64Url("foob")).toBe("Zm9vYg");
		expect(encodeBase64Url("fooba")).toBe("Zm9vYmE");
		expect(encodeBase64Url("foobar")).toBe("Zm9vYmFy");
	});
	test("should encode ArrayBuffer", () => {
		const buf = new Uint8Array([102, 111, 111]); // "foo"
		expect(encodeBase64Url(buf.buffer)).toBe("Zm9v");
	});
	test("should encode TypedArray", () => {
		const arr0 = new Uint8Array([98, 97, 114]); // "bar"
		expect(encodeBase64Url(arr0)).toBe("YmFy");
		const arr1 = new Uint8Array([240, 159, 152, 133]); // "😅"
		expect(encodeBase64Url(arr1)).toBe("8J-YhQ");
	});
	test("should handle non-ASCII (UTF-8) input", () => {
		expect(encodeBase64Url("✓ à la mode")).toBe("4pyTIMOgIGxhIG1vZGU");
		expect(encodeBase64Url("😅")).toBe("8J-YhQ");
	});
});
describe("decodeBase64Bytes()", () => {
	test("should decode Base64 string to correct bytes", () => {
		expect(Array.from(decodeBase64Bytes("Zg=="))).toEqual([102]);
		expect(Array.from(decodeBase64Bytes("Zm8="))).toEqual([102, 111]);
		expect(Array.from(decodeBase64Bytes("Zm9v"))).toEqual([102, 111, 111]);
		expect(Array.from(decodeBase64Bytes("Zm9vYg=="))).toEqual([102, 111, 111, 98]);
		expect(Array.from(decodeBase64Bytes("Zm9vYmE="))).toEqual([102, 111, 111, 98, 97]);
		expect(Array.from(decodeBase64Bytes("Zm9vYmFy"))).toEqual([102, 111, 111, 98, 97, 114]);
	});
	test("should decode empty string to empty Uint8Array", () => {
		expect(Array.from(decodeBase64Bytes(""))).toEqual([]);
	});
	test("should decode non-ASCII (UTF-8) Base64", () => {
		expect(Array.from(decodeBase64Bytes("4pyTIMOgIGxhIG1vZGU="))).toEqual(Array.from(new TextEncoder().encode("✓ à la mode")));
		expect(Array.from(decodeBase64Bytes("8J+YhQ=="))).toEqual(Array.from(new TextEncoder().encode("😅")));
	});
});
describe("decodeBase64UrlString()", () => {
	test("should decode Base64URL string to correct string", () => {
		expect(decodeBase64UrlString("Zg")).toBe("f");
		expect(decodeBase64UrlString("Zm8")).toBe("fo");
		expect(decodeBase64UrlString("Zm9v")).toBe("foo");
		expect(decodeBase64UrlString("Zm9vYg")).toBe("foob");
		expect(decodeBase64UrlString("Zm9vYmE")).toBe("fooba");
		expect(decodeBase64UrlString("Zm9vYmFy")).toBe("foobar");
	});
	test("should decode empty string to empty string", () => {
		expect(decodeBase64UrlString("")).toBe("");
	});
	test("should decode non-ASCII (UTF-8) Base64URL", () => {
		expect(decodeBase64UrlString("4pyTIMOgIGxhIG1vZGU")).toBe("✓ à la mode");
		expect(decodeBase64UrlString("8J-YhQ")).toBe("😅");
	});
});
