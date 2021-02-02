import { InvalidFeedback, ImmutableObject, map, string, number, boolean, MapSchema, Validator } from "..";

// Tests.
describe("MapSchema", () => {
	test("TypeScript", () => {
		// Test map.optional()
		const optionalSchema = map.optional(number.optional);
		const optionalType: MapSchema<number | null> = optionalSchema;
		const optionalValue: Record<string, number | null> = optionalSchema.validate({ a: 1 });
		const optionalItemsSchema = optionalSchema.items;
		const optionalItemsType: Validator<number | null> = optionalItemsSchema;
		const optionalItemsValue: number | null = optionalItemsSchema.validate(123);

		// Test map.required()
		const requiredSchema = map.required(number.required);
		const requiredType: MapSchema<number> = requiredSchema;
		const requiredValue: Record<string, number> = requiredSchema.validate({ a: 1 });
		const requiredItemsSchema = requiredSchema.items;
		const requiredItemsType: Validator<number> = requiredItemsSchema;
		const requiredItemsValue: number = requiredItemsSchema.validate(123);

		// Test map()
		const mapRequiredSchema = map({ items: number.required, required: true });
		const mapRequiredType: MapSchema<number> = mapRequiredSchema;
		const mapRequiredValue: ImmutableObject<number> = mapRequiredSchema.validate({ a: 1 });
		const mapOptionalSchema = map({ items: number.required, required: false });
		const mapOptionalType: MapSchema<number> = mapOptionalSchema;
		const mapOptionalValue: ImmutableObject<number> = mapOptionalSchema.validate({ a: 1 });
		const mapAutoSchema = map({ items: number.required });
		const mapAutoType: MapSchema<number> = mapAutoSchema;
		const mapAutoValue: ImmutableObject<number> = mapAutoSchema.validate({ a: 1 });
	});
	test("Constructs correctly", () => {
		const items = string.required;
		const schema1 = map({ items });
		expect(schema1).toBeInstanceOf(MapSchema);
		expect(schema1.required).toBe(false);
		expect(schema1.items).toBe(items);
		const schema2 = map.required(items);
		expect(schema2).toBeInstanceOf(MapSchema);
		expect(schema2.required).toBe(true);
		expect(schema2.items).toBe(items);
		const schema3 = map.required(items);
		expect(schema3).toBeInstanceOf(MapSchema);
		expect(schema3.required).toBe(true);
		expect(schema3.items).toBe(items);
	});
	describe("validate()", () => {
		const schema = map({ items: string.required });
		test("Non-objects throw error", () => {
			expect(() => map.required(string.required).validate("abc")).toThrow(InvalidFeedback);
			expect(() => map.required(number.required).validate(123)).toThrow(InvalidFeedback);
			expect(() => map.required(boolean.required).validate(true)).toThrow(InvalidFeedback);
		});
		// test("Non-pure objects throw error", () => {
		// 	class RandomClass {}
		// 	expect( schema.validate([])).toEqual(new Invalid("Must be object"));
		// 	expect( schema.validate(new RandomClass())).toEqual(new Invalid("Must be object"));
		// 	expect( schema.validate(new Map())).toEqual(new Invalid("Must be object"));
		// 	expect( schema.validate(new Set())).toEqual(new Invalid("Must be object"));
		// 	expect( schema.validate(() => {})).toEqual(new Invalid("Must be object"));
		// });
		// test("Objects with circular references are invalid", () => {
		// 	const a = {};
		// 	a.circular = a;
		// 	expect( schema.validate(a)).toEqual(new Invalid(Invalid));
		// 	expect( schema.validate(a)).toEqual(new Invalid("Circular reference/));
		// 	const b = { deep: { deeper: { deepest: {} } } };
		// 	b.deep.deeper.deepest = b;
		// 	expect( schema.validate(b)).toEqual(new Invalid(Invalid));
		// 	expect( schema.validate(b)).toEqual(new Invalid("Circular reference/));
		// });
		test("Falsy values return empty object", () => {
			expect(schema.validate(0)).toEqual({});
			expect(schema.validate(null)).toEqual({});
			expect(schema.validate(false)).toEqual({});
		});
	});
	describe("options.value", () => {
		test("Undefined returns default value (empty object)", () => {
			const schema = map({ items: string.required });
			expect(schema.validate(undefined)).toEqual({});
		});
		test("Undefined returns explicit default value", () => {
			const schema = map({ items: number.required, value: { a: 1, b: 2 } });
			expect(schema.validate(undefined)).toEqual({
				a: 1,
				b: 2,
			});
		});
		test("Undefined returns exact same instance of default value", () => {
			const defaultObj = { a: 1, b: 2, c: 3 };
			const schema = map({ items: number.required, value: defaultObj });
			const validObj = schema.validate(undefined);
			expect(validObj).toBe(defaultObj);
		});
	});
	describe("options.required", () => {
		test("Required falsy values return Required", () => {
			const schema = map({ items: string.required, required: true });
			expect(() => schema.validate(0)).toThrow(InvalidFeedback);
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		});
		test("Required empty objects return Required", () => {
			const schema = map({ items: string.required, required: true });
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
		});
		test("Non-required empty objects do not return Required", () => {
			const schema = map({ items: string.required, required: false });
			const obj = {};
			expect(schema.validate(obj)).toBe(obj);
		});
	});
	describe("options.items", () => {
		test("Object with items and passing schema validates its fields", () => {
			const o = { num1: 123, num2: 456 };
			const schema = map({ items: number.required });
			expect(schema.validate(o)).toBe(o);
		});
		test("Object with items and fixable schema validates its fields", () => {
			const schema = map({
				items: number.required,
			});
			expect(schema.validate({ num1: 123, num2: "456" })).toEqual({ num1: 123, num2: 456 });
		});
		test("Object with items rejects invalid props", () => {
			try {
				const schema = map({ items: number.required });
				schema.validate({ num1: 123, num2: 456, str: "abc" });
			} catch (invalid: any) {
				expect(invalid).toBeInstanceOf(InvalidFeedback);
				expect(invalid.messages.str).toEqual("Must be number");
				expect(Object.keys(invalid.messages).length).toBe(1); // No additional errors.
			}
		});
	});
});
