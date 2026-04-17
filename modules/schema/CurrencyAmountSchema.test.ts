import { describe, expect, test } from "bun:test";
import { CURRENCY_AMOUNT, CurrencyAmountSchema, NULLABLE_CURRENCY_AMOUNT } from "./CurrencyAmountSchema.js";
import type { Schema } from "./Schema.js";

test("TypeScript", () => {
	const s1: Schema<number> = CURRENCY_AMOUNT("GBP");
	const r1: number = s1.validate(123.45);

	const s2: Schema<number | null> = NULLABLE_CURRENCY_AMOUNT("GBP");
	const r2: number | null = s2.validate(123.45);

	const s3: Schema<number> = new CurrencyAmountSchema({ currency: "GBP" });
	const r3: number = s3.validate(123.45);

	expect([r1, r2, r3]).toHaveLength(3);
});

describe("CurrencyAmountSchema", () => {
	test("Uses currency metadata and formatting", () => {
		const schema1 = new CurrencyAmountSchema({ currency: "GBP" });
		expect(schema1.currency).toBe("GBP");
		expect(schema1.symbol).toBe("£");
		expect(schema1.step).toBe(0.01);
		expect(schema1.format(12.3)).toBe("£12.30");

		const schema2 = new CurrencyAmountSchema({ currency: "JPY" });
		expect(schema2.currency).toBe("JPY");
		expect(schema2.symbol).toBe("¥");
		expect(schema2.step).toBe(1);
		expect(schema2.format(12.3)).toBe("¥12");
	});

	test("Rounds values to the currency step", () => {
		const gbp = new CurrencyAmountSchema({ currency: "GBP" });
		const jpy = new CurrencyAmountSchema({ currency: "JPY" });

		expect(gbp.validate(12.345)).toBe(12.35);
		expect(jpy.step).toBe(1);
		expect(jpy.validate(12.5)).toBe(13);
	});

	test("Fixes invalidly formatted currencies during construction", () => {
		expect(new CurrencyAmountSchema({ currency: "gbp" }).currency).toBe("GBP");
	});

	test("Rejects unknown currencies during construction", () => {
		expect(() => new CurrencyAmountSchema({ currency: "aaaaaa" })).toThrow("Unknown currency");
	});
});
describe("format()", () => {
	test("Formats correctly in different currencies", () => {
		const schema1 = new CurrencyAmountSchema({ currency: "GBP" });
		expect(schema1.format(12.345)).toBe("£12.35");
		const schema2 = new CurrencyAmountSchema({ currency: "JPY" });
		expect(schema2.format(120_000.345)).toBe("¥120,000");
	});

	test("Currency step 1 or removes decimal places in format()", () => {
		const schema1 = new CurrencyAmountSchema({ currency: "GBP" });
		expect(schema1.format(12.345)).toBe("£12.35");
		expect(schema1.format(12_345.678)).toBe("£12,345.68");
		const schema2 = new CurrencyAmountSchema({ currency: "GBP", step: 1 });
		expect(schema2.format(12.5)).toBe("£13");
		const schema3 = new CurrencyAmountSchema({ currency: "GBP", step: 1000 });
		expect(schema3.format(12_500)).toBe("£12,500");
	});
});
