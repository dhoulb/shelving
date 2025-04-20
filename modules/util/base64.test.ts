import { describe, expect, test } from "bun:test";
import { base64Decode, base64Encode, base64UrlDecode, base64UrlEncode } from "../index.js";

describe("Base64 Utility Functions", () => {
	test("base64Encode should encode a string to Base64", () => {
		expect(base64Encode("hello")).toBe("aGVsbG8");
	});

	test("base64Decode should decode a Base64 string", () => {
		expect(base64Decode("aGVsbG8")).toBe("hello");
		expect(base64Decode("aGVsbG8=")).toBe("hello");
		expect(base64Decode("aGVsbG8====")).toBe("hello");
	});

	test("base64UrlEncode should encode a string to URL-safe Base64", () => {
		expect(base64UrlEncode("hello")).toBe("aGVsbG8");
	});

	test("base64UrlDecode should decode a URL-safe Base64 string", () => {
		expect(base64UrlDecode("aGVsbG8")).toBe("hello");
		expect(base64UrlDecode("aGVsbG8=")).toBe("hello");
		expect(base64UrlDecode("aGVsbG8====")).toBe("hello");
	});
});
