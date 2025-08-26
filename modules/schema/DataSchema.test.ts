import { describe, expect, test } from "bun:test";
import type { Validator } from "../index.js";
import { BOOLEAN, DATA, DataSchema, Feedback, NUMBER, STRING, StringSchema, ValueFeedbacks } from "../index.js";

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
		const props = { a: STRING, b: STRING };
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
		expect(() => schema.validate("abc")).toThrow(Feedback);
		expect(() => schema.validate(123)).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
	});
	test("Falsy values are invalid", () => {
		const schema = new DataSchema({ props: {} });
		expect(() => schema.validate(0)).toThrow(Feedback);
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
	});
	test("Valid value returns unchanged", () => {
		const schema = DATA({ a: STRING, b: STRING });
		const value = { a: "A", b: "B" };
		expect(schema.validate(value)).toBe(value);
	});
	test("Changed/coerced value returns different", () => {
		const schema = DATA({ a: STRING, b: STRING });
		const value = { a: 1, b: "B" };
		expect(schema.validate(value)).toEqual({ a: "1", b: "B" });
		expect(schema.validate(value)).not.toBe(value);
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
		const data = { dogs: "abc", turtles: 10, cats: null };
		const schema = DATA({
			dogs: NUMBER,
			turtles: NUMBER,
			cats: NUMBER,
		});
		try {
			expect<unknown>(schema.validate(data)).toBe("Never");
		} catch (invalid: unknown) {
			expect(invalid).toBeInstanceOf(ValueFeedbacks);
			expect(invalid).toEqual(
				new ValueFeedbacks(
					{
						dogs: "Must be number",
						cats: "Must be number",
					},
					data,
				),
			);
		}
	});
});
