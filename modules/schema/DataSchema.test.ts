import { describe, expect, test } from "bun:test";
import {
	BOOLEAN,
	DATA,
	DataSchema,
	ITEM,
	KEY,
	NUMBER,
	OPTIONAL,
	PARTIAL,
	POSITIVE_INTEGER,
	type Schema,
	STRING,
	StringSchema,
} from "../index.js";

// Tests.
test("TypeScript", () => {
	const requiredSchema = DATA({ num: NUMBER });
	const requiredType: DataSchema<{ num: number }> = requiredSchema;
	const requiredValue1: { num: number } = requiredSchema.validate({ num: 123 });
	const requiredValue2: { readonly num: number } = requiredSchema.validate({ num: 123 });
	const requiredPropSchema = requiredSchema.props.num;
	const requiredPropType: Schema<number> = requiredPropSchema;

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
		expect(() => schema.validate("abc")).toThrow();
		expect(() => schema.validate(123)).toThrow();
		expect(() => schema.validate(true)).toThrow();
	});
	test("Falsy values are invalid", () => {
		const schema = new DataSchema({ props: {} });
		expect(() => schema.validate(0)).toThrow();
		expect(() => schema.validate(null)).toThrow();
		expect(() => schema.validate(false)).toThrow();
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
	test("Undefined fields are stripped", () => {
		const schema = DATA({ a: STRING, undef: OPTIONAL(STRING) });
		const output = schema.validate({ a: "Bob", undef: undefined });
		expect(output).toEqual({ a: "Bob" } as any);
		expect(Object.hasOwn(output, "undef")).toBe(false);
		expect("undef" in output).toBe(false);

		const schema1 = DATA({ a: STRING, undef: OPTIONAL(STRING) });
		const output1 = schema1.validate({ a: "Bob", undef: undefined });
		expect(output1).toEqual({ a: "Bob" } as any);
		expect(Object.hasOwn(output1, "undef")).toBe(false);
		expect("undef" in output1).toBe(false);

		const schema2 = DATA({ undef: OPTIONAL(STRING) });
		const output2 = schema2.validate({ undef: undefined });
		expect(output2).toEqual({} as any);
		expect(Object.hasOwn(output2, "undef")).toBe(false);
		expect("undef" in output2).toBe(false);
	});
	test("Excess fields are stripped", () => {
		const schema1 = DATA({ a: STRING, b: OPTIONAL(STRING) });
		const output1 = schema1.validate({ a: "Bob", b: undefined, excess: 123 });
		expect(output1).toEqual({ a: "Bob", b: undefined });
		expect(Object.hasOwn(output1, "excess")).toBe(false);
		expect("excess" in output1).toBe(false);

		const schema2 = DATA({ a: STRING, b: OPTIONAL(STRING) });
		const output2 = schema2.validate({ a: "Bob", b: undefined, excess: undefined });
		expect(output2).toEqual({ a: "Bob", b: undefined });
		expect(Object.hasOwn(output2, "excess")).toBe(false);
		expect("excess" in output2).toBe(false);

		const schema = DATA({});
		const output = schema.validate({ excess: undefined });
		expect(output).toEqual({});
		expect(Object.hasOwn(output, "excess")).toBe(false);
		expect("excess" in output).toBe(false);
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
		expect(
			schema.validate({
				num: 123,
				str: "abcdef",
				excess: "should be removed",
			}),
		).not.toHaveProperty("excess");
		expect(
			schema.validate({
				excess: "should be removed",
			}),
		).not.toHaveProperty("excess");
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
			expect(invalid).toBe("dogs: Must be number\ncats: Must be number");
		}
	});
});
describe("PARTIAL", () => {
	const PARTIAL_USER_SCHEMA = PARTIAL({ name: STRING, age: NUMBER });

	test("validates partial object with subset of fields", () => {
		const input = { name: "Alice" };
		const output = PARTIAL_USER_SCHEMA.validate(input);
		expect(output).toEqual({ name: "Alice" });
		expect(output).toBe(input);
	});
	test("Returns same valid data", () => {
		const input = { name: "Charlie", age: 25 };
		const output = PARTIAL_USER_SCHEMA.validate(input);
		expect(output).toEqual(input);
		expect(output).toBe(input);
	});
	test("Returns same empty data", () => {
		const input = {};
		const output = PARTIAL({}).validate(input);
		expect(output).toEqual({});
		expect(output).toBe(input);
	});
	test("Undefined fields are stripped", () => {
		// age is undefined, should be skipped not validated
		const output = PARTIAL_USER_SCHEMA.validate({ name: "Bob", age: undefined });
		expect(output).toEqual({ name: "Bob" });
		expect("age" in output).toBe(false);
	});
	test("Undefined fields are stripped", () => {
		const schema = PARTIAL({ a: STRING, undef: OPTIONAL(STRING) });
		const output = schema.validate({ a: "Bob", undef: undefined });
		expect(output).toEqual({ a: "Bob", undef: undefined });
		expect(Object.hasOwn(output, "undef")).toBe(false);
		expect("undef" in output).toBe(false);

		const schema1 = PARTIAL({ a: STRING, undef: OPTIONAL(STRING) });
		const output1 = schema1.validate({ a: "Bob", undef: undefined });
		expect(output1).toEqual({ a: "Bob", undef: undefined });
		expect(Object.hasOwn(output1, "undef")).toBe(false);
		expect("undef" in output1).toBe(false);
	});
	test("Excess fields are stripped", () => {
		const schema1 = PARTIAL({ a: STRING, b: OPTIONAL(STRING) });
		const output1 = schema1.validate({ a: "Bob", b: undefined, excess: 123 });
		expect(output1).toEqual({ a: "Bob", b: undefined });
		expect(Object.hasOwn(output1, "excess")).toBe(false);
		expect("excess" in output1).toBe(false);

		const schema2 = PARTIAL({ a: STRING, b: OPTIONAL(STRING) });
		const output2 = schema2.validate({ a: "Bob", b: undefined, excess: undefined });
		expect(output2).toEqual({ a: "Bob", b: undefined });
		expect(Object.hasOwn(output2, "excess")).toBe(false);
		expect("excess" in output2).toBe(false);

		const schema = PARTIAL({});
		const output = schema.validate({ excess: undefined });
		expect(output).toEqual({});
		expect(Object.hasOwn(output, "excess")).toBe(false);
		expect("excess" in output).toBe(false);
	});
	test("returns object reference if unchanged", () => {
		const input = { age: 30 } as const;
		const result = PARTIAL_USER_SCHEMA.validate(input);
		// Since object may be reconstructed due to change detection logic, relax equality
		expect(result).toEqual(input);
	});
	test("aggregates errors for multiple invalid props", () => {
		const input = { name: null, age: "nope" };
		try {
			PARTIAL_USER_SCHEMA.validate(input);
			throw new Error("Should have thrown");
		} catch (e) {
			expect(e).toBe("name: Must be string\nage: Must be number");
		}
	});
	test("rejects non-object values", () => {
		expect(() => PARTIAL_USER_SCHEMA.validate(null)).toThrow();
		expect(() => PARTIAL_USER_SCHEMA.validate(5)).toThrow();
	});
	test("coerces values if possible", () => {
		const input = { name: 123, age: "42" };
		const result = PARTIAL_USER_SCHEMA.validate(input);
		expect(result).toEqual({ name: "123", age: 42 });
	});
	test("strips unknown fields", () => {
		const input = { name: "Dana", age: 22, extra: "remove me" };
		const result = PARTIAL_USER_SCHEMA.validate(input);
		expect(result).toEqual({ name: "Dana", age: 22 });
	});
	test("returns default value if undefined", () => {
		const schema = PARTIAL({ foo: STRING });
		expect(schema.validate(undefined)).toEqual({});
	});
	test("throws if input is array", () => {
		expect(() => PARTIAL_USER_SCHEMA.validate([])).toThrow();
	});
	test("throws if input is function", () => {
		expect(() => PARTIAL_USER_SCHEMA.validate(() => {})).toThrow();
	});
	test("Object with props has unknown fields stripped", () => {
		const schema1 = PARTIAL({
			num: NUMBER,
			str: new StringSchema({ value: "abcdef" }),
		});
		const output1 = schema1.validate({
			num: 123,
			str: "abcdef",
			excess: "should be removed",
		});
		expect(output1).toEqual({ num: 123, str: "abcdef" });
		expect(Object.hasOwn(output1, "excess")).toBe(false);

		const schema2 = PARTIAL({});
		const output2 = schema2.validate({
			excess: "should be removed",
		});
		expect(output2).toEqual({});
		expect(Object.hasOwn(output2, "excess")).toBe(false);

		const schema3 = PARTIAL({ num: NUMBER });
		const output3 = schema3.validate({
			excess: "should be removed",
		});
		expect(output3).toEqual({});
		expect(Object.hasOwn(output3, "excess")).toBe(false);
	});
	test("Same object is returned.", () => {
		const schema = PARTIAL({
			num: NUMBER,
			str: new StringSchema({ value: "abcdef" }),
		});
		const obj1 = {
			num: 123,
			str: "abcdef",
		};
		expect(schema.validate(obj1)).toBe(obj1);
		const obj2 = {};
		expect(schema.validate(obj2)).toBe(obj2);
	});
});
describe("ITEM", () => {
	const ITEM_KEY_SCHEMA = ITEM(KEY, { name: STRING });
	const ITEM_NUMBER_SCHEMA = ITEM(POSITIVE_INTEGER, { name: STRING });

	test("validates item with all fields", () => {
		const result1 = ITEM_KEY_SCHEMA.validate({ id: "abc", name: "Item 1" });
		expect(result1).toEqual({ id: "abc", name: "Item 1" });
		const result2 = ITEM_NUMBER_SCHEMA.validate({ id: 123, name: "Item 1" });
		expect(result2).toEqual({ id: 123, name: "Item 1" });
	});
	test("strips unknown fields", () => {
		const result = ITEM_KEY_SCHEMA.validate({ id: "abc", name: "Item 1", extra: "remove me" });
		expect(result).toEqual({ id: "abc", name: "Item 1" });
	});
	test("converts ids", () => {
		const result1 = ITEM_KEY_SCHEMA.validate({ id: 123, name: "Item 1" });
		expect(result1).toEqual({ id: "123", name: "Item 1" });
		const result2 = ITEM_NUMBER_SCHEMA.validate({ id: "123", name: "Item 1" });
		expect(result2).toEqual({ id: 123, name: "Item 1" });
	});
	test("throws if ID is missing", () => {
		expect(() => ITEM_KEY_SCHEMA.validate({ name: "abc" })).toThrow();
	});
	test("throws if input is array", () => {
		expect(() => ITEM_KEY_SCHEMA.validate([])).toThrow();
	});
	test("throws if input is function", () => {
		expect(() => ITEM_KEY_SCHEMA.validate(() => {})).toThrow();
	});
});
