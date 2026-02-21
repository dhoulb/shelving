import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { COUNTRY, CountrySchema, getCountry, NULLABLE_COUNTRY } from "../index.js";
import type { Country } from "../util/country.js";

test("TypeScript", () => {
	const s1: Schema<Country | null> = NULLABLE_COUNTRY;
	const r1: Country | null = s1.validate("GB");

	const s2: Schema<Country> = COUNTRY;
	const r2: Country = s2.validate("GB");

	const s3: Schema<Country> = new CountrySchema({ value: "GB" });
	const r3: Country = s3.validate(undefined);
});

describe("CountrySchema", () => {
	test("Validates explicit country values", () => {
		const schema = new CountrySchema({ value: "GB" });
		expect(schema.validate(undefined)).toBe("GB");
		expect(schema.validate("us")).toBe("US");
	});

	test("Detect mode resolves browser country when available", () => {
		const schema = new CountrySchema({});
		const detected = getCountry("detect");
		if (detected) expect(schema.validate("detect")).toBe(detected);
		else expect(() => schema.validate("detect")).toThrow();
	});

	test("Rejects unknown country values", () => {
		const schema = new CountrySchema({});
		expect(() => schema.validate("ZZ")).toThrow();
	});
});
