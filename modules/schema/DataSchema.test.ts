import { InvalidFeedback, Validator, StringSchema, NumberSchema, BooleanSchema, DataSchema, Feedback, DATA, BOOLEAN, NUMBER, STRING, NOVALUE } from "../index.js";

// Tests.
test("TypeScript", () => {
	const requiredSchema = DATA({ num: NUMBER });
	const requiredType: DataSchema<{ num: number }> = requiredSchema;
	const requiredValue1: { num: number } = requiredSchema.validate({ num: 123 });
	const requiredValue2: { readonly num: number } = requiredSchema.validate({ num: 123 });
	const requiredPropSchema = requiredSchema.props.num;
	const requiredPropType: Validator<number> = requiredPropSchema;

	const objectRequiredSchema = new DataSchema({ props: { num: NUMBER } });
	const objectRequiredType: DataSchema<{ num: number }> = objectRequiredSchema;
	const objectRequiredValue: { num: number } = objectRequiredSchema.validate({ num: 123 });
	const objectAutoSchema = new DataSchema({ props: { num: NUMBER } });
	const objectAutoType: DataSchema<{ num: number }> = objectAutoSchema;
	const objectAutoValue: { num: number } = objectAutoSchema.validate({ num: 123 });
});
describe("validate()", () => {
	test("constructor()", () => {
		const props = {};
		const schema1 = new DataSchema({ props });
		expect(schema1).toBeInstanceOf(DataSchema);
		expect(schema1.props).toBe(props);
		const schema2 = DATA(props);
		expect(schema2).toBeInstanceOf(DataSchema);
		expect(schema2.props).toBe(props);
		const schema3 = DATA(props);
		expect(schema3).toBeInstanceOf(DataSchema);
		expect(schema3.props).toBe(props);
	});
	test("Non-objects throw error", () => {
		const schema = new DataSchema({ props: {} });
		expect(() => schema.validate("abc")).toThrow(InvalidFeedback);
		expect(() => schema.validate(123)).toThrow(InvalidFeedback);
		expect(() => schema.validate(true)).toThrow(InvalidFeedback);
	});
	test("Falsy values are invalid", () => {
		const schema = new DataSchema({ props: {} });
		expect(() => schema.validate(0)).toThrow(InvalidFeedback);
		expect(() => schema.validate(null)).toThrow(InvalidFeedback);
		expect(() => schema.validate(false)).toThrow(InvalidFeedback);
	});
});
describe("options.value", () => {
	test("Undefined returns default value (empty array)", () => {
		const schema = new DataSchema({ props: {} });
		expect(schema.validate(undefined)).toEqual({});
	});
	test("Undefined returns default value", () => {
		const defaultValue = { a: 1, b: 2 };
		const schema = new DataSchema({ props: { a: NUMBER, b: NUMBER }, value: defaultValue });
		expect(schema.validate(undefined)).toEqual(defaultValue);
	});
});
describe("options.props", () => {
	test("Object with props that validates is returned unchanged", () => {
		const a = { num: 123, str: "abc", bool: true };
		const schema = new DataSchema({
			props: {
				num: NUMBER,
				str: STRING,
				bool: BOOLEAN,
			},
		});
		expect(schema.validate(a)).toEqual(a);
	});
	test("Object with props and missing props has them created", () => {
		const schema = new DataSchema({
			props: {
				num: NUMBER,
				str: new StringSchema({ value: "abcdef" }),
				bool: BOOLEAN,
			},
		});
		expect(schema.validate({ num: 123 })).toEqual({ num: 123, str: "abcdef", bool: false });
	});
	test("Object with props and fixable schema is fixed", () => {
		const schema = new DataSchema({
			props: {
				num: NUMBER,
				str: STRING,
			},
		});
		expect(schema.validate({ num: "123", str: 123 })).toEqual({ num: 123, str: "123" });
	});
	test("Object with props has unknown fields stripped", () => {
		const schema = new DataSchema({
			props: {
				num: NUMBER,
				str: new StringSchema({ value: "abcdef" }),
			},
		});
		expect(
			schema.validate({
				num: 123,
				str: "abcdef",
				excess: "should be removed",
			}),
		).toEqual({ num: 123, str: "abcdef" });
	});
	test("Objects with errors in subschemas returns Invalids", () => {
		try {
			const schema = new DataSchema({
				props: {
					dogs: NUMBER,
					turtles: NUMBER,
					cats: NUMBER,
				},
			});
			expect(schema.validate({ dogs: "abc", turtles: 10, cats: null })).toBe(NOVALUE);
		} catch (invalid: any) {
			expect(invalid).toBeInstanceOf(InvalidFeedback);
			expect(invalid.messages.dogs).toEqual("Must be number");
			expect(invalid.messages.cats).toEqual("Must be number");
			expect(Object.keys(invalid.messages).length).toBe(2); // No additional errors.
		}
	});
});
