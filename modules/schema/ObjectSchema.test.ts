import { InvalidFeedback, Validator, StringSchema, NumberSchema, BooleanSchema, ObjectSchema } from "..";

// Tests.
describe("ObjectSchema", () => {
	test("TypeScript validate()", () => {
		const requiredSchema = ObjectSchema.from({ num: NumberSchema.REQUIRED });
		const requiredType: ObjectSchema<{ num: number }> = requiredSchema;
		const requiredTYPE1: { num: number } = requiredSchema.TYPE;
		const requiredTYPE2: { readonly num: number } = requiredSchema.TYPE;
		const requiredValue1: { num: number } = requiredSchema.validate({ num: 123 });
		const requiredValue2: { readonly num: number } = requiredSchema.validate({ num: 123 });
		const requiredPropSchema = requiredSchema.props.num;
		const requiredPropType: Validator<number> = requiredPropSchema;
		const requiredPropValue: number = requiredPropSchema.validate(123);

		const objectRequiredSchema = ObjectSchema.create({ props: { num: NumberSchema.REQUIRED }, required: true });
		const objectRequiredType: ObjectSchema<{ num: number }> = objectRequiredSchema;
		const objectRequiredValue: { num: number } = objectRequiredSchema.validate({ num: 123 });
		const objectOptionalSchema = ObjectSchema.create({ props: { num: NumberSchema.REQUIRED }, required: false });
		const objectOptionalType: ObjectSchema<{ num: number } | null> = objectOptionalSchema;
		const objectOptionalValue: { num: number } | null = objectOptionalSchema.validate({ num: 123 });
		const objectAutoSchema = ObjectSchema.create({ props: { num: NumberSchema.REQUIRED } });
		const objectAutoType: ObjectSchema<{ num: number } | null> = objectAutoSchema;
		const objectAutoValue: { num: number } | null = objectAutoSchema.validate({ num: 123 });
	});
	test("Constructs correctly", () => {
		const props = {};
		const schema1 = ObjectSchema.create({ props });
		expect(schema1).toBeInstanceOf(ObjectSchema);
		expect(schema1.required).toBe(false);
		expect(schema1.props).toBe(props);
		const schema2 = ObjectSchema.from(props);
		expect(schema2).toBeInstanceOf(ObjectSchema);
		expect(schema2.required).toBe(true);
		expect(schema2.props).toBe(props);
		const schema3 = ObjectSchema.from(props);
		expect(schema3).toBeInstanceOf(ObjectSchema);
		expect(schema3.required).toBe(true);
		expect(schema3.props).toBe(props);
	});
	describe("validate() (no partial flag)", () => {
		test("Non-objects throw error", () => {
			const schema = ObjectSchema.create({ props: {} });
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
			const schema = ObjectSchema.create({ props: {} });
			expect(schema.validate(0)).toBe(null);
			expect(schema.validate(null)).toBe(null);
			expect(schema.validate(false)).toBe(null);
		});
		describe("options.value", () => {
			test("Undefined returns default value (null)", () => {
				const schema = ObjectSchema.create({ props: {} });
				expect(schema.validate(undefined)).toEqual(null);
			});
			test("Undefined returns explicit default value", () => {
				const defaultValue = { a: 1, b: 2 };
				const schema = ObjectSchema.create({ props: { a: NumberSchema.REQUIRED, b: NumberSchema.REQUIRED }, value: defaultValue });
				expect(schema.validate(undefined)).toBe(defaultValue);
			});
			test("Undefined returns exact same instance of default value", () => {
				const defaultObj = { a: 1, b: 2 };
				const schema = ObjectSchema.create({ props: { a: NumberSchema.REQUIRED, b: NumberSchema.REQUIRED }, value: defaultObj });
				const validObj = schema.validate(undefined);
				expect(validObj).toBe(defaultObj);
			});
		});
		describe("options.required", () => {
			test("Required null objects return Required", () => {
				const schema = ObjectSchema.create({ props: {}, required: true });
				expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			});
			test("Required non-null objects are not invalid", () => {
				const schema = ObjectSchema.create({ props: {}, required: true });
				const obj = {};
				expect(schema.validate(obj)).toBe(obj);
			});
			test("Non-required empty objects do not return Required", () => {
				const schema = ObjectSchema.create({ props: {}, required: false });
				const obj = {};
				expect(schema.validate(obj)).toBe(obj);
			});
		});
		describe("options.props", () => {
			test("Object with props that validates is returned unchanged", () => {
				const a = { num: 123, str: "abc", bool: true };
				const schema = ObjectSchema.create({
					props: {
						num: NumberSchema.REQUIRED,
						str: StringSchema.OPTIONAL,
						bool: BooleanSchema.OPTIONAL,
					},
				});
				expect(schema.validate(a)).toBe(a);
			});
			test("Object with props and missing props has them created", () => {
				const schema = ObjectSchema.create({
					props: {
						num: NumberSchema.REQUIRED,
						str: StringSchema.create({ value: "abcdef" }),
						bool: BooleanSchema.OPTIONAL,
					},
				});
				expect(schema.validate({ num: 123 })).toEqual({ num: 123, str: "abcdef", bool: false });
			});
			test("Object with props and fixable schema is fixed", () => {
				const schema = ObjectSchema.create({
					props: {
						num: NumberSchema.REQUIRED,
						str: StringSchema.OPTIONAL,
					},
				});
				expect(schema.validate({ num: "123", str: 123 })).toEqual({ num: 123, str: "123" });
			});
			test("Object with props has unknown fields stripped", () => {
				const schema = ObjectSchema.create({
					props: {
						num: NumberSchema.REQUIRED,
						str: StringSchema.create({ value: "abcdef" }),
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
					const schema = ObjectSchema.create({
						props: {
							dogs: NumberSchema.REQUIRED,
							turtles: NumberSchema.REQUIRED,
							cats: NumberSchema.create({ required: true }),
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
	describe(".validate() with partial option", () => {
		test("Validates a partial object", () => {
			const schema = ObjectSchema.create({ props: { bool: BooleanSchema.REQUIRED, str: StringSchema.REQUIRED } });

			// Normal schema flags invalid props.
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate({ str: "abc" })).toThrow(InvalidFeedback);
			expect(() => schema.validate({ bool: true })).toThrow(InvalidFeedback);
			expect(() => schema.validate({ bool: undefined, str: "abc" })).toThrow(InvalidFeedback);
			expect(() => schema.validate({ bool: true, str: undefined })).toThrow(InvalidFeedback);

			// Partial schema does not flag invalid props.
			expect(schema.validate({}, { partial: true })).toEqual({});
			expect(schema.validate({ str: "abc" }, { partial: true })).toEqual({ str: "abc" });
			expect(schema.validate({ bool: true }, { partial: true })).toEqual({ bool: true });
			expect(schema.validate({ bool: undefined, str: "abc" }, { partial: true })).toEqual({ str: "abc" });
			expect(schema.validate({ bool: true, str: undefined }, { partial: true })).toEqual({ bool: true });
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = ObjectSchema.create({
				props: { num: NumberSchema.REQUIRED },
				validator: props => {
					throw feedback;
				},
			});
			try {
				schema.validate({ num: 123 });
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
