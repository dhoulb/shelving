import { InvalidFeedback, boolean, data, object, string } from "..";

describe(".change()", () => {
	test("Modifies an object schema to be partial", () => {
		const schema = data({ props: { bool: boolean.required, str: string.required } });
		const partialSchema = schema.change;
		expect(schema).not.toBe(partialSchema);

		// Normal schema flags invalid props.
		expect(() => schema.validate({})).toThrow(InvalidFeedback);
		expect(() => schema.validate({ bool: undefined, str: "abc" })).toThrow(InvalidFeedback);
		expect(() => schema.validate({ bool: true, str: undefined })).toThrow(InvalidFeedback);

		// Partial schema does not flag invalid props.
		expect(partialSchema.validate({})).toEqual({});
		expect(partialSchema.validate({ bool: undefined, str: "abc" })).toEqual({ bool: undefined, str: "abc" });
		expect(partialSchema.validate({ bool: true, str: undefined })).toEqual({ bool: true, str: undefined });
	});
	test("Modifies a deep object schema to be partial", () => {
		const schema = data({ props: { obj: object.required({ bool: boolean.required, str: string.required }) } });
		const partialSchema = schema.change;
		expect(schema).not.toBe(partialSchema);

		// Normal schema flags invalid props.
		expect(() => schema.validate({})).toThrow(InvalidFeedback);
		expect(() => schema.validate({ obj: {} })).toThrow(InvalidFeedback);
		expect(() => schema.validate({ obj: undefined })).toThrow(InvalidFeedback);
		expect(() => schema.validate({ obj: { bool: undefined, str: "abc" } })).toThrow(InvalidFeedback);
		expect(() => schema.validate({ obj: { bool: true, str: undefined } })).toThrow(InvalidFeedback);
		expect(() => schema.validate({ obj: { bool: true } })).toThrow(InvalidFeedback);

		// Partial schema does not flag invalid props.
		expect(partialSchema.validate({})).toEqual({});
		expect(partialSchema.validate({ obj: {} })).toEqual({ obj: {} });
		expect(partialSchema.validate({ obj: undefined })).toEqual({ obj: undefined });
		expect(partialSchema.validate({ obj: { bool: undefined, str: "abc" } })).toEqual({ obj: { bool: undefined, str: "abc" } });
		expect(partialSchema.validate({ obj: { bool: true, str: undefined } })).toEqual({ obj: { bool: true, str: undefined } });
		expect(partialSchema.validate({ obj: { bool: true } })).toEqual({ obj: { bool: true } });
	});
});
