import { describe, expect, test } from "bun:test";
import { ValueError } from "shelving/error";
import { toData, toDataValue, toFirestoreFields, toFirestoreValue } from "shelving/firebase";
import { basic1, person1 } from "../test/index.js";

describe("toFirestoreValue()", () => {
	test("converts primitives", () => {
		expect(toFirestoreValue(null)).toEqual({ nullValue: null });
		expect(toFirestoreValue(true)).toEqual({ booleanValue: true });
		expect(toFirestoreValue(false)).toEqual({ booleanValue: false });
		expect(toFirestoreValue("abc")).toEqual({ stringValue: "abc" });
		expect(toFirestoreValue("")).toEqual({ stringValue: "" });
	});

	test("converts safe integers to integerValue and other numbers to doubleValue", () => {
		expect(toFirestoreValue(0)).toEqual({ integerValue: "0" });
		expect(toFirestoreValue(-0)).toEqual({ integerValue: "0" });
		expect(toFirestoreValue(123)).toEqual({ integerValue: "123" });
		expect(toFirestoreValue(-45)).toEqual({ integerValue: "-45" });
		expect(toFirestoreValue(Number.MAX_SAFE_INTEGER)).toEqual({ integerValue: "9007199254740991" });
		expect(toFirestoreValue(1.5)).toEqual({ doubleValue: 1.5 });
		expect(toFirestoreValue(Number.MAX_SAFE_INTEGER + 2)).toEqual({ doubleValue: Number.MAX_SAFE_INTEGER + 2 });
	});

	test("converts arrays and plain objects recursively", () => {
		expect(toFirestoreValue([1, "a", null])).toEqual({
			arrayValue: { values: [{ integerValue: "1" }, { stringValue: "a" }, { nullValue: null }] },
		});
		expect(toFirestoreValue({ a: { b: true } })).toEqual({
			mapValue: { fields: { a: { mapValue: { fields: { b: { booleanValue: true } } } } } },
		});
	});

	test("throws ValueError for unrepresentable values", () => {
		expect(() => toFirestoreValue(undefined)).toThrow(ValueError);
		expect(() => toFirestoreValue(Number.NaN)).toThrow(ValueError);
		expect(() => toFirestoreValue(Number.POSITIVE_INFINITY)).toThrow(ValueError);
		expect(() => toFirestoreValue(() => undefined)).toThrow(ValueError);
		expect(() => toFirestoreValue(new Date())).toThrow(ValueError);
		expect(() => toFirestoreValue(Symbol("nope"))).toThrow(ValueError);
	});
});

describe("toDataValue()", () => {
	test("converts primitives", () => {
		expect(toDataValue({ nullValue: null })).toBe(null);
		expect(toDataValue({ booleanValue: true })).toBe(true);
		expect(toDataValue({ stringValue: "abc" })).toBe("abc");
		expect(toDataValue({ stringValue: "" })).toBe("");
		expect(toDataValue({ integerValue: "123" })).toBe(123);
		expect(toDataValue({ integerValue: 123 })).toBe(123);
		expect(toDataValue({ doubleValue: 1.5 })).toBe(1.5);
	});

	test("passes foreign types through as JSON-safe values", () => {
		expect(toDataValue({ timestampValue: "2026-01-01T00:00:00Z" })).toBe("2026-01-01T00:00:00Z");
		expect(toDataValue({ referenceValue: "projects/p/databases/d/documents/c/x" })).toBe("projects/p/databases/d/documents/c/x");
		expect(toDataValue({ bytesValue: "aGk=" })).toBe("aGk=");
		expect(toDataValue({ geoPointValue: { latitude: 1, longitude: 2 } })).toEqual({ latitude: 1, longitude: 2 });
	});

	test("converts arrays and maps recursively (missing values mean empty)", () => {
		expect(toDataValue({ arrayValue: {} })).toEqual([]);
		expect(toDataValue({ mapValue: {} })).toEqual({});
		expect(toDataValue({ arrayValue: { values: [{ integerValue: "1" }] } })).toEqual([1]);
	});

	test("throws ValueError for unrecognised values", () => {
		expect(() => toDataValue({})).toThrow(ValueError);
	});
});

describe("toFirestoreFields() / toData()", () => {
	test("skips undefined props when encoding", () => {
		expect(toFirestoreFields({ a: 1, b: undefined })).toEqual({ a: { integerValue: "1" } });
	});

	test("round-trips fixture data", () => {
		const { id: _id1, ...basicData } = basic1;
		expect(toData(toFirestoreFields(basicData))).toEqual(basicData);
		const { id: _id2, ...personData } = person1;
		expect(toData(toFirestoreFields(personData))).toEqual(personData);
	});

	test("round-trips deeply nested data", () => {
		const deep = { a: [{ b: [1, 2.5, null, "x"] }, true], c: { d: { e: [] } } };
		expect(toData(toFirestoreFields(deep))).toEqual(deep);
	});
});
