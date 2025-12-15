import { describe, expect, test } from "bun:test";
import { parseDocblock } from "./docblock.js";

describe("parseDocblock()", () => {
	test("parses description, params, returns, and examples", () => {
		const raw = `
/**
 * Adds two numbers together.
 * Supports integers.
 * @param {number} a first number
 * @param {number} b second number
 * @returns {number} sum of inputs
 * @example add(1, 2)
 */
`;
		const result = parseDocblock(raw);
		expect(result.description).toBe("Adds two numbers together.\nSupports integers.");
		expect(result.params).toEqual([
			{ name: "a", type: "number", description: "first number" },
			{ name: "b", type: "number", description: "second number" },
		]);
		expect(result.returns).toEqual([{ type: "number", description: "sum of inputs" }]);
		expect(result.examples).toEqual(["add(1, 2)"]);
	});

	test("handles blocks without tags", () => {
		const raw = `
/**
 * Only description
 */
`;
		const result = parseDocblock(raw);
		expect(result.description).toBe("Only description");
		expect(result.params).toBeUndefined();
		expect(result.returns).toBeUndefined();
		expect(result.examples).toBeUndefined();
	});
});
