import { InvalidFeedback } from "shelving/feedback";
import type { ReadonlyObject } from "shelving/tools";
import { map, string, number, boolean, NumberSchema, MapSchema, Validator } from ".";

// Tests.
describe("MapSchema", () => {
	test("TypeScript", () => {
		// Test map.optional()
		const s1: MapSchema<ReadonlyObject<number | null>> = map.optional(number.optional);
		const v1: Record<string, number | null> = s1.validate({ a: 1 });
		const ss1: Validator<number | null> = s1.items;
		const sr1: number | null = ss1.validate(123);

		// Test map.required()
		const s2: MapSchema<ReadonlyObject<number>> = map.required(number.required);
		const v2: ReadonlyObject<number> = s2.validate({ a: 1 });
		const ss2: Validator<number> = s2.items;
		const sr2: number = ss2.validate(134);

		// Test map()
		const s3: MapSchema<ReadonlyObject<number>> = map({ items: number.required, required: true });
		const v3: ReadonlyObject<number> = s3.validate({ a: 1 });
		const s4: MapSchema<ReadonlyObject<number>> = map({ items: number.required, required: false });
		const v4: ReadonlyObject<number> = s4.validate({ a: 1 });
		const s5: MapSchema<ReadonlyObject<number>> = map({ items: number.required });
		const v5: ReadonlyObject<number> = s5.validate({ a: 1 });
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
