import { InvalidFeedback, ImmutableObject, ObjectSchema, Validator, STRING, BOOLEAN, OBJECT, NUMBER, getFeedbackMessages } from "../index.js";

// Tests.
test("TypeScript", () => {
	const requiredSchema = OBJECT(NUMBER);
	const requiredType: ObjectSchema<number> = requiredSchema;
	const requiredValue: Record<string, number> = requiredSchema.validate({ a: 1 });
	const requiredItemsSchema = requiredSchema.items;
	const requiredItemsType: Validator<number> = requiredItemsSchema;

	const objSchema = new ObjectSchema({ items: NUMBER });
	const objType: ObjectSchema<number> = objSchema;
	const objValue: ImmutableObject<number> = objSchema.validate({ a: 1 });
});
test("constructor()", () => {
	const items = STRING;
	const schema1 = new ObjectSchema({ items });
	expect(schema1).toBeInstanceOf(ObjectSchema);
	expect(schema1.items).toBe(items);
	const schema2 = OBJECT(items);
	expect(schema2).toBeInstanceOf(ObjectSchema);
	expect(schema2.items).toBe(items);
});
describe("validate()", () => {
	const schema = new ObjectSchema({ items: STRING });
	test("Non-objects throw error", () => {
		expect(() => OBJECT(STRING).validate("abc")).toThrow(InvalidFeedback);
		expect(() => OBJECT(NUMBER).validate(123)).toThrow(InvalidFeedback);
		expect(() => OBJECT(BOOLEAN).validate(true)).toThrow(InvalidFeedback);
		expect(() => schema.validate(0)).toThrow(InvalidFeedback);
		expect(() => schema.validate(null)).toThrow(InvalidFeedback);
		expect(() => schema.validate(false)).toThrow(InvalidFeedback);
	});
});
describe("options.value", () => {
	test("Undefined returns default value (empty object)", () => {
		const schema = new ObjectSchema({ items: STRING });
		expect(schema.validate(undefined)).toEqual({});
	});
	test("Undefined returns explicit default value", () => {
		const schema = new ObjectSchema({ items: NUMBER, value: { a: 1, b: 2 } });
		expect(schema.validate(undefined)).toEqual({ a: 1, b: 2 });
	});
	test("Undefined returns exact same instance of default value", () => {
		const defaultObj = { a: 1, b: 2, c: 3 };
		const schema = new ObjectSchema({ items: NUMBER, value: defaultObj });
		const validObj = schema.validate(undefined);
		expect(validObj).toEqual(defaultObj);
	});
});
describe("options.items", () => {
	test("Object with items and passing schema validates its fields", () => {
		const o = { num1: 123, num2: 456 };
		const schema = new ObjectSchema({ items: NUMBER });
		expect(schema.validate(o)).toEqual(o);
	});
	test("Object with items and fixable schema validates its fields", () => {
		const schema = new ObjectSchema({ items: NUMBER });
		expect(schema.validate({ num1: 123, num2: "456" })).toEqual({ num1: 123, num2: 456 });
	});
	test("Object with items rejects invalid props", () => {
		try {
			const schema = new ObjectSchema({ items: NUMBER });
			expect(schema.validate({ num1: 123, num2: 456, str: "abc" })).toBe("Never");
		} catch (invalid: any) {
			expect(invalid).toBeInstanceOf(InvalidFeedback);
			const messages = getFeedbackMessages(invalid);
			expect(messages.str).toEqual("Must be number");
			expect(Object.keys(messages).length).toBe(1); // No additional errors.
		}
	});
});
