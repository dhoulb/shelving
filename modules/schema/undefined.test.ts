import { InvalidFeedback, string, withUndefined } from "..";

describe("withUndefined()", () => {
	test("Modifies a schema to allow undefined", () => {
		const schema = string.required;
		const modifiedSchema = withUndefined(schema);
		expect(schema).not.toBe(modifiedSchema);
		expect(() => schema.validate(undefined)).toThrow(InvalidFeedback); // Normally will be invalid.
		expect(modifiedSchema.validate(undefined)).toBe(undefined); // Allows undefined.
		expect(modifiedSchema.validate("abc")).toBe("abc"); // Still allows normal values.
		expect(modifiedSchema.validate(123)).toBe("123"); // Still modifies normal values.
	});
});
