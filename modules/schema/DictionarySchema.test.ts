import { describe, expect, test } from "bun:test";
import { BOOLEAN, DICTIONARY, DictionarySchema, type ImmutableDictionary, NUMBER, type Schema, STRING } from "../index.js";

// Tests.
test("TypeScript", () => {
	const requiredSchema = DICTIONARY(NUMBER);
	const requiredType: DictionarySchema<number> = requiredSchema;
	const requiredValue: Record<string, number> = requiredSchema.validate({ a: 1 });
	const requiredItemsSchema = requiredSchema.items;
	const requiredItemsType: Schema<number> = requiredItemsSchema;

	const objSchema = new DictionarySchema({ items: NUMBER });
	const objType: DictionarySchema<number> = objSchema;
	const objValue: ImmutableDictionary<number> = objSchema.validate({ a: 1 });
});
test("constructor()", () => {
	const items = STRING;
	const schema1 = new DictionarySchema({ items });
	expect(schema1).toBeInstanceOf(DictionarySchema);
	expect(schema1.items).toBe(items);
	const schema2 = DICTIONARY(items);
	expect(schema2).toBeInstanceOf(DictionarySchema);
	expect(schema2.items).toBe(items);
});
describe("validate()", () => {
	const schema = new DictionarySchema({ items: STRING });
	test("Non-objects throw error", () => {
		expect(() => DICTIONARY(STRING).validate("abc")).toThrow();
		expect(() => DICTIONARY(NUMBER).validate(123)).toThrow();
		expect(() => DICTIONARY(BOOLEAN).validate(true)).toThrow();
		expect(() => schema.validate(0)).toThrow();
		expect(() => schema.validate(null)).toThrow();
		expect(() => schema.validate(false)).toThrow();
	});
});
describe("options.value", () => {
	test("Undefined returns default value (empty object)", () => {
		const schema = new DictionarySchema({ items: STRING });
		expect(schema.validate(undefined)).toEqual({});
	});
	test("Undefined returns explicit default value", () => {
		const schema = new DictionarySchema({ items: NUMBER, value: { a: 1, b: 2 } });
		expect(schema.validate(undefined)).toEqual({ a: 1, b: 2 });
	});
	test("Undefined returns exact same instance of default value", () => {
		const defaultObj = { a: 1, b: 2, c: 3 };
		const schema = new DictionarySchema({ items: NUMBER, value: defaultObj });
		const validObj = schema.validate(undefined);
		expect(validObj).toEqual(defaultObj);
	});
});
describe("options.items", () => {
	test("Object with items and passing schema validates its fields", () => {
		const o = { num1: 123, num2: 456 };
		const schema = new DictionarySchema({ items: NUMBER });
		expect(schema.validate(o)).toEqual(o);
	});
	test("Object with items and fixable schema validates its fields", () => {
		const schema = new DictionarySchema({ items: NUMBER });
		expect(schema.validate({ num1: 123, num2: "456" })).toEqual({ num1: 123, num2: 456 });
	});
	test("Object with items rejects invalid props", () => {
		const dict = { num1: 123, num2: 456, str: "abc" };
		const schema = new DictionarySchema({ items: NUMBER });
		try {
			expect<unknown>(schema.validate(dict)).toBe("Never");
		} catch (invalid: unknown) {
			expect(invalid).toBe("str: Must be number");
		}
	});
});
describe("options.one and options.many", () => {
	test("One and many are inherited from items schema", () => {
		const schema = new DictionarySchema({ items: NUMBER });
		expect(schema.one).toEqual("number");
		expect(schema.many).toEqual("numbers");
		expect(schema.placeholder).toEqual("No numbers");
	});
});
