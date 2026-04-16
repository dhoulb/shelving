import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { CURRENCY_CODE, CurrencyCodeSchema, NULLABLE_CURRENCY_CODE } from "../index.js";

test("TypeScript", () => {
	// Test currencyCode.optional
	const s1: Schema<string | null> = NULLABLE_CURRENCY_CODE;
	const r1: string | null = s1.validate("gbp");

	// Test currencyCode.required
	const s2: Schema<string> = CURRENCY_CODE;
	const r2: string = s2.validate("usd");

	// Test currencyCode({})
	const s3: Schema<string> = new CurrencyCodeSchema({});
	const r3: string = s3.validate("eur");

	expect(r1).toBe("GBP");
	expect(r2).toBe("USD");
	expect(r3).toBe("EUR");
});

test("constructor()", () => {
	const schema1 = new CurrencyCodeSchema({});
	expect(schema1).toBeInstanceOf(CurrencyCodeSchema);
	const schema2 = CURRENCY_CODE;
	expect(schema2).toBeInstanceOf(CurrencyCodeSchema);
	const schema3 = CURRENCY_CODE;
	expect(schema3).toBeInstanceOf(CurrencyCodeSchema);
});

describe("validate()", () => {
	const schema = new CurrencyCodeSchema({});

	test("Valid currency codes are valid", () => {
		expect(schema.validate("GBP")).toBe("GBP");
		expect(schema.validate("USD")).toBe("USD");
	});

	test("Whitespace and other characters are stripped", () => {
		expect(schema.validate("    gbp    ")).toBe("GBP");
		expect(schema.validate("u s d")).toBe("USD");
		expect(schema.validate("e-u_r")).toBe("EUR");
	});

	test("Fixable currency codes are fixed", () => {
		expect(schema.validate("g$b£p")).toBe("GBP");
		expect(schema.validate("usd123")).toBe("USD");
	});

	test("Invalid currency codes are invalid", () => {
		expect(() => schema.validate("US")).toThrow("Invalid currency");
		expect(() => schema.validate("USDT")).toThrow("Invalid currency");
		expect(() => schema.validate("ZZZ")).toThrow("Unknown currency code");
	});

	test("Non-strings are invalid", () => {
		expect(() => schema.validate(false)).toThrow("Required");
		expect(() => schema.validate(null)).toThrow("Required");
		expect(() => schema.validate("")).toThrow("Required");
		expect(() => schema.validate("abc")).toThrow("Unknown currency code");
		expect(() => schema.validate({})).toThrow("Must be currency");
		expect(() => schema.validate([])).toThrow("Must be currency");
		expect(() => schema.validate(["a"])).toThrow("Must be currency");
		expect(() => schema.validate(true)).toThrow("Must be currency");
	});
});

describe("options.currencies", () => {
	test("Restricts valid codes to the provided list", () => {
		const schema = new CurrencyCodeSchema({ currencies: ["GBP", "USD"] });
		expect(schema.validate("gbp")).toBe("GBP");
		expect(schema.validate("usd")).toBe("USD");
		expect(() => schema.validate("EUR")).toThrow("Unknown currency code");
	});
});

describe("options.value", () => {
	test("Undefined returns default default value (empty string)", () => {
		const schema = new CurrencyCodeSchema({});
		expect(() => schema.validate(undefined)).toThrow();
	});

	test("Undefined with default value returns default value", () => {
		const schema = new CurrencyCodeSchema({ value: "GBP" });
		expect(schema.validate(undefined)).toBe("GBP");
	});
});
