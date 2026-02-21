import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { ADDRESS, AddressSchema, formatAddress, NULLABLE_ADDRESS } from "../index.js";

test("TypeScript", () => {
	const s1: Schema<{ address1: string; address2: string; city: string; state: string; postcode: string; country: string } | null> =
		NULLABLE_ADDRESS;
	const r1 = s1.validate({
		address1: "1 Main St",
		address2: "",
		city: "London",
		state: "London",
		postcode: "sw1a 1aa",
		country: "GB",
	});

	const s2 = new AddressSchema({});
	const r2 = s2.validate({
		address1: "1 Main St",
		address2: "",
		city: "London",
		state: "London",
		postcode: "sw1a 1aa",
		country: "GB",
	});
});

describe("AddressSchema", () => {
	test("Validates a full address", () => {
		const output = ADDRESS.validate({
			address1: "1 Main St",
			address2: "Unit 2",
			city: "London",
			state: "Greater London",
			postcode: "sw1a 1aa",
			country: "GB",
		});
		expect(output.postcode).toBe("SW1A 1AA");
		expect(output.country).toBe("GB");
	});

	test("Formats address lines", () => {
		const formatted = formatAddress({
			address1: "1 Main St",
			address2: "",
			city: "London",
			state: "Greater London",
			postcode: "SW1A 1AA",
			country: "GB",
		});
		expect(formatted.endsWith("United Kingdom")).toBe(true);
	});
});
