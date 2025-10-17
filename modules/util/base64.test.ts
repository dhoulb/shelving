import { describe, expect, test } from "bun:test";
import {
	decodeBase64Bytes,
	decodeBase64String,
	decodeBase64URLBytes,
	decodeBase64URLString,
	encodeBase64,
	encodeBase64URL,
	ValueError,
} from "../index.js";

describe("encodeBase64()", () => {
	test("encode ASCII strings correctly", () => {
		expect(encodeBase64("f")).toBe("Zg==");
		expect(encodeBase64("fo")).toBe("Zm8=");
		expect(encodeBase64("foo")).toBe("Zm9v");
		expect(encodeBase64("foob")).toBe("Zm9vYg==");
		expect(encodeBase64("fooba")).toBe("Zm9vYmE=");
		expect(encodeBase64("foobar")).toBe("Zm9vYmFy");
	});
	test("encode empty string to empty string", () => {
		expect(encodeBase64("")).toBe("");
	});
	test("encode ArrayBuffer", () => {
		const buf = new Uint8Array([102, 111, 111]); // "foo"
		expect(encodeBase64(buf.buffer)).toBe("Zm9v");
	});
	test("encode TypedArray", () => {
		const arr = new Uint8Array([98, 97, 114]); // "bar"
		expect(encodeBase64(arr)).toBe("YmFy");
	});
	test("handle non-ASCII (UTF-8) input", () => {
		expect(encodeBase64("✓ à la mode")).toBe("4pyTIMOgIGxhIG1vZGU=");
		expect(encodeBase64("😅")).toBe("8J+YhQ==");
	});
});
describe("decodeBase64Bytes()", () => {
	test("decode Base64 string to correct bytes", () => {
		expect(Array.from(decodeBase64Bytes("Zg=="))).toEqual([102]);
		expect(Array.from(decodeBase64Bytes("Zm8="))).toEqual([102, 111]);
		expect(Array.from(decodeBase64Bytes("Zm9v"))).toEqual([102, 111, 111]);
		expect(Array.from(decodeBase64Bytes("Zm9vYg=="))).toEqual([102, 111, 111, 98]);
		expect(Array.from(decodeBase64Bytes("Zm9vYmE="))).toEqual([102, 111, 111, 98, 97]);
		expect(Array.from(decodeBase64Bytes("Zm9vYmFy"))).toEqual([102, 111, 111, 98, 97, 114]);
	});
	test("every valid character can be decoded", () => {
		expect(decodeBase64Bytes("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")).toBeInstanceOf(Uint8Array);
		expect(decodeBase64Bytes("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+/")).toBeInstanceOf(Uint8Array);
	});
	test("decode empty string to empty Uint8Array", () => {
		expect(Array.from(decodeBase64Bytes(""))).toEqual([]);
	});
	test("decode non-ASCII (UTF-8) Base64", () => {
		expect(Array.from(decodeBase64Bytes("4pyTIMOgIGxhIG1vZGU="))).toEqual(Array.from(new TextEncoder().encode("✓ à la mode")));
		expect(Array.from(decodeBase64Bytes("8J+YhQ=="))).toEqual(Array.from(new TextEncoder().encode("😅")));
	});
});
describe("decodeBase64String()", () => {
	test("decode Base64 string to correct string", () => {
		expect(decodeBase64String("Zg==")).toBe("f");
		expect(decodeBase64String("Zm8=")).toBe("fo");
		expect(decodeBase64String("Zm9v")).toBe("foo");
		expect(decodeBase64String("Zm9vYg==")).toBe("foob");
		expect(decodeBase64String("Zm9vYmE=")).toBe("fooba");
		expect(decodeBase64String("Zm9vYmFy")).toBe("foobar");
	});
	test("every valid character can be decoded", () => {
		expect(decodeBase64String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")).toBeString();
		expect(decodeBase64String("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+/")).toBeString();
	});
	test("decode empty string to empty string", () => {
		expect(decodeBase64String("")).toBe("");
	});
	test("decode non-ASCII (UTF-8) Base64", () => {
		expect(decodeBase64String("4pyTIMOgIGxhIG1vZGU=")).toBe("✓ à la mode");
		expect(decodeBase64String("8J+YhQ==")).toBe("😅");
	});
	test("throw on invalid Base64 strings with invalid characters", () => {
		expect(() => decodeBase64String("Zm9v*YmE")).toThrow(ValueError);
		expect(() => decodeBase64String("Zm9vYmE!")).toThrow(ValueError);
		expect(() => decodeBase64String("Zm9vYmE$")).toThrow(ValueError);
		expect(() => decodeBase64String("Zm9vYmE=")).not.toThrow(); // padding is valid in base64, but not in base64url
		expect(() => decodeBase64String("Zm9vYmE_")).not.toThrow(); // '_' is valid in base64url
		expect(() => decodeBase64String("Zm9vYmE-")).not.toThrow(); // '-' is valid in base64url
	});
	test("decode and ignore padding '=' characters", () => {
		expect(decodeBase64String("Zm8=")).toBe("fo");
		expect(decodeBase64String("Zm8==")).toBe("fo");
		expect(decodeBase64String("Zm8===")).toBe("fo");
		expect(decodeBase64String("Zm8====")).toBe("fo");
		expect(decodeBase64String("Zm9vYg==")).toBe("foob");
		expect(decodeBase64String("Zm9vYg===")).toBe("foob");
	});
});
describe("encodeBase64Url()", () => {
	test("encode ASCII strings correctly", () => {
		expect(encodeBase64URL("f")).toBe("Zg");
		expect(encodeBase64URL("fo")).toBe("Zm8");
		expect(encodeBase64URL("foo")).toBe("Zm9v");
		expect(encodeBase64URL("foob")).toBe("Zm9vYg");
		expect(encodeBase64URL("fooba")).toBe("Zm9vYmE");
		expect(encodeBase64URL("foobar")).toBe("Zm9vYmFy");
	});
	test("encode ArrayBuffer", () => {
		const buf = new Uint8Array([102, 111, 111]); // "foo"
		expect(encodeBase64URL(buf.buffer)).toBe("Zm9v");
	});
	test("encode TypedArray", () => {
		const arr0 = new Uint8Array([98, 97, 114]); // "bar"
		expect(encodeBase64URL(arr0)).toBe("YmFy");
		const arr1 = new Uint8Array([240, 159, 152, 133]); // "😅"
		expect(encodeBase64URL(arr1)).toBe("8J-YhQ");
	});
	test("handle non-ASCII (UTF-8) input", () => {
		expect(encodeBase64URL("✓ à la mode")).toBe("4pyTIMOgIGxhIG1vZGU");
		expect(encodeBase64URL("😅")).toBe("8J-YhQ");
	});
});
describe("decodeBase64UrlBytes()", () => {
	test("decode Base64URL string to correct bytes", () => {
		expect(Array.from(decodeBase64URLBytes("Zg"))).toEqual([102]);
		expect(Array.from(decodeBase64URLBytes("Zm8"))).toEqual([102, 111]);
		expect(Array.from(decodeBase64URLBytes("Zm9v"))).toEqual([102, 111, 111]);
		expect(Array.from(decodeBase64URLBytes("Zm9vYg"))).toEqual([102, 111, 111, 98]);
		expect(Array.from(decodeBase64URLBytes("Zm9vYmE"))).toEqual([102, 111, 111, 98, 97]);
		expect(Array.from(decodeBase64URLBytes("Zm9vYmFy"))).toEqual([102, 111, 111, 98, 97, 114]);
	});
	test("every valid character can be decoded", () => {
		expect(decodeBase64URLBytes("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")).toBeInstanceOf(Uint8Array);
		expect(decodeBase64URLBytes("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+/")).toBeInstanceOf(Uint8Array);
	});
	test("decode empty string to empty Uint8Array", () => {
		expect(Array.from(decodeBase64URLBytes(""))).toEqual([]);
	});
	test("decode non-ASCII (UTF-8) Base64URL", () => {
		expect(Array.from(decodeBase64URLBytes("4pyTIMOgIGxhIG1vZGU"))).toEqual(Array.from(new TextEncoder().encode("✓ à la mode")));
		expect(Array.from(decodeBase64URLBytes("8J-YhQ"))).toEqual(Array.from(new TextEncoder().encode("😅")));
	});
});
describe("decodeBase64UrlString()", () => {
	test("decode Base64URL string to correct string", () => {
		expect(decodeBase64URLString("Zg")).toBe("f");
		expect(decodeBase64URLString("Zm8")).toBe("fo");
		expect(decodeBase64URLString("Zm9v")).toBe("foo");
		expect(decodeBase64URLString("Zm9vYg")).toBe("foob");
		expect(decodeBase64URLString("Zm9vYmE")).toBe("fooba");
		expect(decodeBase64URLString("Zm9vYmFy")).toBe("foobar");
	});
	test("every valid character can be decoded", () => {
		expect(decodeBase64URLString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")).toBeString();
		expect(decodeBase64URLString("ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_+/")).toBeString();
	});
	test("decode empty string to empty string", () => {
		expect(decodeBase64URLString("")).toBe("");
	});
	test("decode non-ASCII (UTF-8) Base64URL", () => {
		expect(decodeBase64URLString("4pyTIMOgIGxhIG1vZGU")).toBe("✓ à la mode");
		expect(decodeBase64URLString("8J-YhQ")).toBe("😅");
	});
	test("throw on invalid Base64URL strings with invalid characters", () => {
		expect(() => decodeBase64URLString("Zm9v*YmE")).toThrow(ValueError);
		expect(() => decodeBase64URLString("Zm9vYmE!")).toThrow(ValueError);
		expect(() => decodeBase64URLString("Zm9vYmE$")).toThrow(ValueError);
		expect(() => decodeBase64URLString("Zm9vYmE=")).not.toThrow(); // padding is valid in base64, but not in base64url
		expect(() => decodeBase64URLString("Zm9vYmE_")).not.toThrow(); // '_' is valid in base64url
		expect(() => decodeBase64URLString("Zm9vYmE-")).not.toThrow(); // '-' is valid in base64url
	});
	test("decode and ignore padding '=' characters", () => {
		expect(decodeBase64URLString("Zm8=")).toBe("fo");
		expect(decodeBase64URLString("Zm8==")).toBe("fo");
		expect(decodeBase64URLString("Zm8===")).toBe("fo");
		expect(decodeBase64URLString("Zm8====")).toBe("fo");
		expect(decodeBase64URLString("Zm9vYg==")).toBe("foob");
		expect(decodeBase64URLString("Zm9vYg===")).toBe("foob");
	});
});
describe("base64/base64url edge cases", () => {
	test("decode/encode with missing/excessive padding", () => {
		expect(decodeBase64String("Zm8")).toBe("fo");
		expect(decodeBase64String("Zm8=")).toBe("fo");
		expect(decodeBase64String("Zm8==")).toBe("fo");
		expect(decodeBase64String("Zm8====")).toBe("fo");
		expect(decodeBase64URLString("Zm8")).toBe("fo");
		expect(decodeBase64URLString("Zm8==")).toBe("fo");
	});
	test("decode/encode with only padding characters", () => {
		expect(decodeBase64String("==")).toBe("");
		expect(decodeBase64String("====")).toBe("");
		expect(decodeBase64URLString("==")).toBe("");
		expect(decodeBase64URLString("====")).toBe("");
	});
	test("decode/encode with non-string/non-buffer input", () => {
		// encoding
		expect(() => encodeBase64(123 as any)).toThrow();
		expect(() => encodeBase64URL({} as any)).toThrow();
		expect(() => encodeBase64(null as any)).toThrow();
		expect(() => encodeBase64URL(undefined as any)).toThrow();
		// decoding
		expect(() => decodeBase64String(123 as any)).toThrow();
		expect(() => decodeBase64URLString({} as any)).toThrow();
		expect(() => decodeBase64Bytes(null as any)).toThrow();
		expect(() => decodeBase64URLBytes(undefined as any)).toThrow();
	});
	test("decode/encode with very large input", () => {
		const big = "a".repeat(1024 * 1024); // 1MB
		const b64 = encodeBase64(big);
		const b64url = encodeBase64URL(big);
		expect(decodeBase64String(b64)).toBe(big);
		expect(decodeBase64URLString(b64url)).toBe(big);
	});
});
