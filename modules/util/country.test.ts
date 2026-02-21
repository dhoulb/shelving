import { describe, expect, test } from "bun:test";
import { COUNTRIES, getCountry } from "../index.js";

describe("getCountry()", () => {
	test("Returns explicit country codes", () => {
		expect(getCountry("GB")).toBe("GB");
		expect(getCountry("us")).toBe("US");
	});

	test("Detect mode never throws and resolves to a known code or undefined", () => {
		const detected = getCountry();
		if (detected) expect(Object.hasOwn(COUNTRIES, detected)).toBe(true);
		else expect(detected).toBeUndefined();
	});

	test("Invalid values return undefined", () => {
		expect(getCountry("ZZ")).toBeUndefined();
		expect(getCountry(null)).toBeUndefined();
	});
});
