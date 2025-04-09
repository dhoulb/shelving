import { describe, expect, test } from "bun:test";
import type { Validator } from "../index.js";
import { BOOLEAN, Feedback, ITEM, ItemSchema, KEY, KeySchema, NUMBER, STRING, StringSchema, ValueFeedbacks } from "../index.js";

// Tests.
test("TypeScript", () => {
	const requiredSchema = ITEM({ num: NUMBER });
	const requiredType: ItemSchema<{ num: number }> = requiredSchema;
	const requiredValue1: { num: number } = requiredSchema.validate({ id: "a", num: 123 });
	const requiredValue2: { readonly num: number } = requiredSchema.validate({ id: "a", num: 123 });
	const requiredPropSchema = requiredSchema.props.num;
	const requiredPropType: Validator<number> = requiredPropSchema;

	const objectRequiredSchema = new ItemSchema({ props: { num: NUMBER } });
	const objectRequiredType: ItemSchema<{ num: number }> = objectRequiredSchema;
	const objectRequiredValue: { num: number } = objectRequiredSchema.validate({ id: "a", num: 123 });
	const objectAutoSchema = new ItemSchema({ props: { num: NUMBER } });
	const objectAutoType: ItemSchema<{ num: number }> = objectAutoSchema;
	const objectAutoValue: { num: number } = objectAutoSchema.validate({ id: "a", num: 123 });
});
describe("validate()", () => {
	test("constructor()", () => {
		const props = { a: STRING };
		const schema1 = new ItemSchema({ props });
		expect(schema1).toBeInstanceOf(ItemSchema);
		expect(schema1.props.id).toBe(KEY);
		expect(schema1.props.a).toBe(STRING);
		const schema2 = ITEM(props);
		expect(schema2).toBeInstanceOf(ItemSchema);
		expect(schema1.props.id).toBe(KEY);
		expect(schema1.props.a).toBe(STRING);
	});
	test("Non-objects throw error", () => {
		const schema = new ItemSchema({ props: {} });
		expect(() => schema.validate("abc")).toThrow(Feedback);
		expect(() => schema.validate(123)).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
	});
	test("Falsy values are invalid", () => {
		const schema = new ItemSchema({ props: {} });
		expect(() => schema.validate(0)).toThrow(Feedback);
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
	});
});
describe("options.value", () => {
	test("Undefined returns default value", () => {
		const defaultValue = { id: "a", a: 1, b: 2 };
		const schema = new ItemSchema({ props: { a: NUMBER, b: NUMBER }, value: defaultValue });
		expect(schema.validate(undefined)).toEqual(defaultValue);
	});
});
describe("options.props", () => {
	test("Object with props that validates is returned unchanged", () => {
		const a = { id: "a", num: 123, str: "abc", bool: true };
		const schema = new ItemSchema({
			props: {
				num: NUMBER,
				str: STRING,
				bool: BOOLEAN,
			},
		});
		expect(schema.validate(a)).toEqual(a);
	});
	test("Object with props and missing props has them created", () => {
		const schema = new ItemSchema({
			props: {
				num: NUMBER,
				str: new StringSchema({ value: "abcdef" }),
				bool: BOOLEAN,
			},
		});
		expect(schema.validate({ id: "a", num: 123 })).toEqual({ id: "a", num: 123, str: "abcdef", bool: false });
	});
	test("Object with props and fixable schema is fixed", () => {
		const schema = new ItemSchema({
			props: {
				num: NUMBER,
				str: STRING,
			},
		});
		expect(schema.validate({ id: "a", num: "123", str: 123 })).toEqual({ id: "a", num: 123, str: "123" });
	});
	test("Object with props has unknown fields stripped", () => {
		const schema = new ItemSchema({
			props: {
				num: NUMBER,
				str: new StringSchema({ value: "abcdef" }),
			},
		});
		expect(
			schema.validate({
				id: "a",
				num: 123,
				str: "abcdef",
				excess: "should be removed",
			}),
		).toEqual({ id: "a", num: 123, str: "abcdef" });
	});
	test("Objects with invalid ID returns Feedbacks", () => {
		const data = { id: false, num: 1 };
		const schema = ITEM({
			num: NUMBER,
		});
		try {
			expect<unknown>(schema.validate(data)).toBe("Never");
		} catch (invalid: unknown) {
			expect(invalid).toBeInstanceOf(ValueFeedbacks);
			expect(invalid).toEqual(
				new ValueFeedbacks(
					{
						id: "Must be string",
					},
					data,
				),
			);
		}
	});
	test("Objects with invalid ID returns Feedbacks", () => {
		const data = { id: "0192837465019283746501928374650192837465019283746501928374650192837465", num: 1 };
		const schema = ITEM(
			{
				num: NUMBER,
			},
			new KeySchema({ max: 10 }),
		);
		try {
			expect<unknown>(schema.validate(data)).toBe("Never");
		} catch (invalid: unknown) {
			expect(invalid).toBeInstanceOf(ValueFeedbacks);
			expect(invalid).toEqual(
				new ValueFeedbacks(
					{
						id: "Maximum 10 characters",
					},
					data,
				),
			);
		}
	});
	test("Objects with errors in subschemas returns Feedbacks", () => {
		const data = { id: "a", dogs: "abc", turtles: 10, cats: null };
		const schema = ITEM({
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
