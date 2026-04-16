import { describe, expect, test } from "bun:test";
import { CURRENCY_CODES, formatCurrency, getCurrencySymbol } from "../index.js";

test("TypeScript", () => {
	const amount: string = formatCurrency(12.34, "GBP");
	expect(amount).toBe("£12.34");
});

describe("getCurrencyCodes()", () => {
	test("Includes common currencies", () => {
		expect(CURRENCY_CODES).toContain("GBP");
		expect(CURRENCY_CODES).toContain("USD");
	});
});

describe("getCurrencySymbol()", () => {
	test("Returns the narrow currency symbol", () => {
		expect(getCurrencySymbol("GBP")).toBe("£");
		expect(getCurrencySymbol("USD")).toBe("$");
		expect(getCurrencySymbol("JPY")).toBe("¥");
	});
});

describe("formatCurrencyAmount()", () => {
	test("Formats amounts with shelving defaults", () => {
		expect(formatCurrency(1234.5, "GBP")).toBe("£1,234.50");
	});
});
