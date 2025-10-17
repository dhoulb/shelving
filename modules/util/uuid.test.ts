import { describe, expect, test } from "bun:test";
import { getUUID, RequiredError, randomUUID, requireUUID } from "../index.js";

// filepath: /Users/dhoulb/Repos/shelving/modules/util/uuid.test.ts

const VALID_UUID_CANONICAL = "123e4567e89b12d3a456426614174000";
const VALID_UUID_DASH = "123e4567-e89b-12d3-a456-426614174000";
const VALID_UUID_UPPER = VALID_UUID_CANONICAL.toUpperCase();
const VALID_UUID_BRACED = `{${VALID_UUID_CANONICAL}}`;
const VALID_UUID_PUNCT = `${VALID_UUID_CANONICAL}!!!`;
const UUID_V4_REGEX = /^[0-9a-f]{32}$/;

describe("randomUUID()", () => {
	test("returns a valid v4 UUID", () => {
		const id = randomUUID();
		expect(typeof id).toBe("string");
		expect(id.length).toBe(32);
		expect(id).toMatch(UUID_V4_REGEX);
	});
	test("multiple calls are valid and (likely) unique", () => {
		const ids = Array.from({ length: 5 }, () => randomUUID());
		for (const id of ids) {
			expect(id).toMatch(UUID_V4_REGEX);
			expect(getUUID(id)).toBe(id);
			expect(requireUUID(id)).toBe(id);
		}
		expect(new Set(ids).size).toBe(ids.length);
	});
});

describe("getUUID()", () => {
	test("accepts canonical form", () => {
		expect(getUUID(VALID_UUID_CANONICAL)).toBe(VALID_UUID_CANONICAL);
	});
	test("normalizes uppercase", () => {
		expect(getUUID(VALID_UUID_UPPER)).toBe(VALID_UUID_CANONICAL);
	});
	test("removes dashes to 32 hex chars", () => {
		expect(getUUID(VALID_UUID_DASH)).toBe(VALID_UUID_CANONICAL);
	});
	test("strips braces", () => {
		expect(getUUID(VALID_UUID_BRACED)).toBe(VALID_UUID_CANONICAL);
	});
	test("strips extra punctuation", () => {
		expect(getUUID(VALID_UUID_PUNCT)).toBe(VALID_UUID_CANONICAL);
	});
	test("returns undefined for empty / short / non-hex", () => {
		expect(getUUID("")).toBeUndefined();
		expect(getUUID("123")).toBeUndefined();
		expect(getUUID("zzzz")).toBeUndefined(); // cleaned => length < 32
		expect(getUUID("!!!")).toBeUndefined();
	});
	test("returns undefined for non-string", () => {
		expect(getUUID(undefined as any)).toBeUndefined();
		expect(getUUID(null as any)).toBeUndefined();
		expect(getUUID(123 as any)).toBeUndefined();
	});
});

describe("requireUUID()", () => {
	test("returns canonical for valid inputs", () => {
		expect(requireUUID(VALID_UUID_CANONICAL)).toBe(VALID_UUID_CANONICAL);
		expect(requireUUID(VALID_UUID_UPPER)).toBe(VALID_UUID_CANONICAL);
		expect(requireUUID(VALID_UUID_DASH)).toBe(VALID_UUID_CANONICAL);
	});
	test("throws RequiredError for invalid", () => {
		expect(() => requireUUID("")).toThrow(RequiredError);
		expect(() => requireUUID("abc")).toThrow(RequiredError);
		expect(() => requireUUID("not-a-uuid")).toThrow(RequiredError);
		expect(() => requireUUID("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz")).toThrow(RequiredError);
	});
});
