import { describe, expect, test } from "bun:test";
import { CURRENCY, CurrencyAmountSchema, NULLABLE_CURRENCY } from "./CurrencyAmountSchema.js";
import type { Schema } from "./Schema.js";

test("TypeScript", () => {
	const s1: Schema<number> = CURRENCY("GBP");
	const r1: number = s1.validate(123.45);

	const s2: Schema<number | null> = NULLABLE_CURRENCY("GBP");
	const r2: number | null = s2.validate(123.45);

	const s3: Schema<number> = new CurrencyAmountSchema({ currency: "GBP" });
	const r3: number = s3.validate(123.45);

	expect([r1, r2, r3]).toHaveLength(3);
});

describe("CurrencyAmountSchema", () => {
	test("Uses currency metadata and formatting", () => {
		const schema = new CurrencyAmountSchema({ currency: "GBP" });

		expect(schema.currency).toBe("GBP");
		expect(schema.symbol).toBe("£");
		expect(schema.step).toBe(0.01);
		expect(schema.format(12.3)).toBe("£12.30");
	});

	test("Rounds values to the currency step", () => {
		const gbp = new CurrencyAmountSchema({ currency: "GBP" });
		const jpy = new CurrencyAmountSchema({ currency: "JPY" });

		expect(gbp.validate(12.345)).toBe(12.35);
		expect(jpy.step).toBe(1);
		expect(jpy.validate(12.5)).toBe(13);
	});

	test("Uses the exported default schema", () => {
		expect(CURRENCY("GBP").currency).toBe("GBP");
		expect(CURRENCY("GBP").validate(undefined)).toBe(0);
		expect(CURRENCY("USD").currency).toBe("USD");
		expect(CURRENCY("USD").validate(undefined)).toBe(0);
		expect(CURRENCY("EUR").currency).toBe("EUR");
		expect(CURRENCY("EUR").validate(undefined)).toBe(0);
	});

	test("Fixes invalidly formatted currencies during construction", () => {
		expect(new CurrencyAmountSchema({ currency: "gbp" }).currency).toBe("GBP");
	});

	test("Rejects unknown currencies during construction", () => {
		expect(() => new CurrencyAmountSchema({ currency: "aaaaaa" })).toThrow("Unknown currency");
	});
});
