import { InvalidFeedback, Validator, object, number, StringSchema, NumberSchema, BooleanSchema, ObjectSchema } from "..";

// Tests.
describe("ObjectSchema", () => {
	test("TypeScript validate()", () => {
		// Test object.optional()
		const optionalSchema = object.optional({ num: number.optional });
		const optionalType: ObjectSchema<{ num: number | null } | null> = optionalSchema;
		const optionalValue: { num: number | null } | null = optionalSchema.validate({ num: 123 });
		const optionalPropSchema = optionalSchema.props.num;
		const optionalPropType: Validator<number | null> = optionalPropSchema;
		const optionalPropValue: number | null = optionalPropSchema.validate(123);

		// Test object.required()
		const requiredSchema = object.required({ num: number.required });
		const requiredType: ObjectSchema<{ num: number }> = requiredSchema;
		const requiredValue: { num: number } = requiredSchema.validate({ num: 123 });
		const requiredPropSchema = requiredSchema.props.num;
		const requiredPropType: Validator<number> = requiredPropSchema;
		const requiredPropValue: number = requiredPropSchema.validate(123);

		// Test object()
		const objectRequiredSchema = object({ props: { num: number.required }, required: true });
		const objectRequiredType: ObjectSchema<{ num: number }> = objectRequiredSchema;
		const objectRequiredValue: { num: number } = objectRequiredSchema.validate({ num: 123 });
		const objectOptionalSchema = object({ props: { num: number.required }, required: false });
		const objectOptionalType: ObjectSchema<{ num: number } | null> = objectOptionalSchema;
		const objectOptionalValue: { num: number } | null = objectOptionalSchema.validate({ num: 123 });
		const objectAutoSchema = object({ props: { num: number.required } });
		const objectAutoType: ObjectSchema<{ num: number } | null> = objectAutoSchema;
		const objectAutoValue: { num: number } | null = objectAutoSchema.validate({ num: 123 });
	});
	test("Constructs correctly", () => {
		const props = {};
		const schema1 = object({ props });
		expect(schema1).toBeInstanceOf(ObjectSchema);
		expect(schema1.required).toBe(false);
		expect(schema1.props).toBe(props);
		const schema2 = object.required(props);
		expect(schema2).toBeInstanceOf(ObjectSchema);
		expect(schema2.required).toBe(true);
		expect(schema2.props).toBe(props);
		const schema3 = object.required(props);
		expect(schema3).toBeInstanceOf(ObjectSchema);
		expect(schema3.required).toBe(true);
		expect(schema3.props).toBe(props);
	});
	describe("validate() (no partial flag)", () => {
		test("Non-objects throw error", () => {
			const schema = object({ props: {} });
			expect(() => schema.validate("abc")).toThrow(InvalidFeedback);
			expect(() => schema.validate(123)).toThrow(InvalidFeedback);
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
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
		test("Falsy values return null", () => {
			const schema = object({ props: {} });
			expect(schema.validate(0)).toBe(null);
			expect(schema.validate(null)).toBe(null);
			expect(schema.validate(false)).toBe(null);
		});
		describe("options.value", () => {
			test("Undefined returns default value (null)", () => {
				const schema = object({ props: {} });
				expect(schema.validate(undefined)).toEqual(null);
			});
			test("Undefined returns explicit default value", () => {
				const defaultValue = { a: 1, b: 2 };
				const schema = object({ props: { a: new NumberSchema({}), b: new NumberSchema({}) }, value: defaultValue });
				expect(schema.validate(undefined)).toBe(defaultValue);
			});
			test("Undefined returns exact same instance of default value", () => {
				const defaultObj = { a: 1, b: 2 };
				const schema = object({ props: { a: new NumberSchema({}), b: new NumberSchema({}) }, value: defaultObj });
				const validObj = schema.validate(undefined);
				expect(validObj).toBe(defaultObj);
			});
		});
		describe("options.required", () => {
			test("Required null objects return Required", () => {
				const schema = object({ props: {}, required: true });
				expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			});
			test("Required non-null objects are not invalid", () => {
				const schema = object({ props: {}, required: true });
				const obj = {};
				expect(schema.validate(obj)).toBe(obj);
			});
			test("Non-required empty objects do not return Required", () => {
				const schema = object({ props: {}, required: false });
				const obj = {};
				expect(schema.validate(obj)).toBe(obj);
			});
		});
		describe("options.props", () => {
			test("Object with props that validates is returned unchanged", () => {
				const a = { num: 123, str: "abc", bool: true };
				const schema = object({
					props: {
						num: new NumberSchema({}),
						str: new StringSchema({}),
						bool: new BooleanSchema({}),
					},
				});
				expect(schema.validate(a)).toBe(a);
			});
			test("Object with props and missing props has them created", () => {
				const schema = object({
					props: {
						num: new NumberSchema({}),
						str: new StringSchema({ value: "abcdef" }),
						bool: new BooleanSchema({}),
					},
				});
				expect(schema.validate({ num: 123 })).toEqual({ num: 123, str: "abcdef", bool: false });
			});
			test("Object with props and fixable schema is fixed", () => {
				const schema = object({
					props: {
						num: new NumberSchema({}),
						str: new StringSchema({}),
					},
				});
				expect(schema.validate({ num: "123", str: 123 })).toEqual({ num: 123, str: "123" });
			});
			test("Object with props has unknown fields stripped", () => {
				const schema = object({
					props: {
						num: new NumberSchema({}),
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
					const schema = object({
						props: {
							dogs: new NumberSchema({}),
							turtles: new NumberSchema({}),
							cats: new NumberSchema({ required: true }),
						},
					});
					schema.validate({ dogs: "abc", turtles: 10, cats: false });
				} catch (invalid: any) {
					expect(invalid).toBeInstanceOf(InvalidFeedback);
					expect(invalid.messages.dogs).toEqual("Must be number");
					expect(invalid.messages.cats).toEqual("Required");
					expect(Object.keys(invalid.messages).length).toBe(2); // No additional errors.
				}
			});
		});
	});
});
