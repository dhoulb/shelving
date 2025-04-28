import { describe, expect, test } from "bun:test";
import { decodeBase64, decodeBase64Url, encodeBase64, encodeBase64Url } from "../index.js";

describe("Base64 Utility Functions", () => {
	test("base64Encode should encode a string to Base64", () => {
		expect(encodeBase64("hello")).toBe("aGVsbG8");
	});

	test("base64Decode should decode a Base64 string", () => {
		expect(decodeBase64("aGVsbG8")).toBe("hello");
		expect(decodeBase64("aGVsbG8=")).toBe("hello");
		expect(decodeBase64("aGVsbG8====")).toBe("hello");
	});

	test("base64UrlEncode should encode a string to URL-safe Base64", () => {
		expect(encodeBase64Url("hello")).toBe("aGVsbG8");
	});

	test("base64UrlDecode should decode a URL-safe Base64 string", () => {
		expect(decodeBase64Url("aGVsbG8")).toBe("hello");
		expect(decodeBase64Url("aGVsbG8=")).toBe("hello");
		expect(decodeBase64Url("aGVsbG8====")).toBe("hello");
	});
});
