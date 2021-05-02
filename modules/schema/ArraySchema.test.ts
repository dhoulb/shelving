import { InvalidFeedback, Schema, ArraySchema, NumberSchema, ObjectSchema, StringSchema, Validator } from "..";

// Vars.
const stringArray = ["a", "b", "c"];
const numberArray = [1, 2, 3];
const longArray = ["a", "b", "c", "d", "e", "f", "g", "h"];
const nestedArray = [{ title: "abc" }, { title: "def" }, { title: "ghi" }];
const randomArray = [{ a: 1 }, 2, { iii: { three: 3 } }, false];

// Tests.
describe("ArraySchema", () => {
	test("TypeScript", () => {
		const requiredSchema = ArraySchema.of(NumberSchema.REQUIRED);
		const requiredType: ArraySchema<number> = requiredSchema;
		const requiredValue: ReadonlyArray<number> = requiredSchema.validate([123]);
		const requiredItemsSchema: Validator<number> = requiredSchema.items;
		const requiredItemsValue: number = requiredItemsSchema.validate(123);

		const arrayRequiredSchema = ArraySchema.create({ items: StringSchema.REQUIRED, required: true });
		const arrayRequiredType: ArraySchema<string> = arrayRequiredSchema;
		const arrayRequiredv4: ReadonlyArray<string> = arrayRequiredSchema.validate([123]);
		const arrayOptionalSchema = ArraySchema.create({ items: StringSchema.REQUIRED, required: false });
		const arrayOptionalType: ArraySchema<string> = arrayOptionalSchema;
		const arrayOptionalv5: ReadonlyArray<string> = arrayOptionalSchema.validate([123]);
		const arrayAutoSchema = ArraySchema.create({ items: StringSchema.REQUIRED });
		const arrayAutoType: ArraySchema<string> = arrayAutoSchema;
		const arrayAutov3: ReadonlyArray<string> = arrayAutoSchema.validate([123]);
	});
	test("Constructs correctly", () => {
		const items = StringSchema.REQUIRED;
		const schema1 = ArraySchema.create({ items });
		expect(schema1).toBeInstanceOf(ArraySchema);
		expect(schema1.required).toBe(false);
		expect(schema1.items).toBe(items);
		const schema2 = ArraySchema.of(items);
		expect(schema2).toBeInstanceOf(ArraySchema);
		expect(schema2.required).toBe(false);
		expect(schema2.items).toBe(items);
	});
	describe("validate()", () => {
		const schema = ArraySchema.create({ items: StringSchema.REQUIRED });
		test("Valid arrays are unchanged (same instance)", () => {
			expect(ArraySchema.of(StringSchema.REQUIRED).validate(stringArray)).toBe(stringArray);
			expect(ArraySchema.of(NumberSchema.REQUIRED).validate(numberArray)).toBe(numberArray);
			expect(ArraySchema.of(StringSchema.REQUIRED).validate(longArray)).toBe(longArray);
			expect(ArraySchema.of(ObjectSchema.of({ title: StringSchema.REQUIRED })).validate(nestedArray)).toBe(nestedArray);
		});
		test("Non-arrays are invalid", () => {
			expect(() => schema.validate("abc")).toThrow(InvalidFeedback);
			expect(() => schema.validate(123)).toThrow(InvalidFeedback);
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
			expect(() => schema.validate(() => {})).toThrow(InvalidFeedback);
		});
	});
	describe("options.value", () => {
		test("Works correctly and returns same instance", () => {
			const arr = [1, 2, 3];
			const schema = ArraySchema.create({ items: NumberSchema.REQUIRED, value: arr });
			expect(schema.validate(undefined)).toBe(arr);
		});
		test("Undefined and falsy returns empty array", () => {
			const schema = ArraySchema.create({ items: StringSchema.REQUIRED });
			expect(schema.validate(undefined)).toEqual([]);
			expect(schema.validate(0)).toEqual([]);
			expect(schema.validate(false)).toEqual([]);
			expect(schema.validate("")).toEqual([]);
		});
	});
	describe("options.unique", () => {
		test("Arrays with duplicate items are made unique", () => {
			const schema = ArraySchema.create({ items: StringSchema.REQUIRED, unique: true });
			expect(schema.validate(["a", "b", "c", "a"])).toEqual(["a", "b", "c"]);
		});
		test("Arrays without duplicate items return the same instance", () => {
			const arr = ["a", "b", "c"];
			const schema = ArraySchema.create({ items: StringSchema.REQUIRED, unique: true });
			expect(schema.validate(arr)).toBe(arr);
		});
		test("Duplicates are allowed if unique is false", () => {
			const arr = ["a", "b", "c", "a"];
			const schema1 = ArraySchema.create({ items: StringSchema.REQUIRED }); // False is the default.
			expect(schema1.validate(arr)).toBe(arr);
			const schema2 = ArraySchema.create({ items: StringSchema.REQUIRED, unique: false });
			expect(schema2.validate(arr)).toBe(arr);
		});
	});
	describe("options.max", () => {
		test("Arrays with more items than maximum are invalid", () => {
			const schema = ArraySchema.create({ max: 1, items: StringSchema.REQUIRED });
			expect(() => schema.validate(numberArray)).toThrow(InvalidFeedback);
		});
		test("Arrays with leItemsSchema than maximum return unchanged", () => {
			const schema = ArraySchema.create({ max: 10, items: NumberSchema.REQUIRED });
			expect(schema.validate(numberArray)).toBe(numberArray);
		});
	});
	describe("options.min", () => {
		test("Arrays with leItemsSchema than minimum are invalid", () => {
			const schema = ArraySchema.create({ min: 10, items: StringSchema.REQUIRED });
			expect(() => schema.validate(numberArray)).toThrow(InvalidFeedback);
		});
		test("Arrays with more items than minimum return unchanged", () => {
			const schema = ArraySchema.create({ min: 1, items: NumberSchema.REQUIRED });
			expect(schema.validate(numberArray)).toBe(numberArray);
		});
	});
	describe("options.required", () => {
		test("Required empty arrays are invalid", () => {
			const schema = ArraySchema.create({ required: true, items: StringSchema.REQUIRED });
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
		});
		test("Required nonempty arrays do not throw", () => {
			const schema = ArraySchema.create({ required: true, items: StringSchema.REQUIRED });
			expect(() => schema.validate(numberArray)).not.toThrow();
		});
	});
	describe("options.items", () => {
		test("Arrays that validate are unchanged (same instance)", () => {
			const schema1 = ArraySchema.create({ items: StringSchema.OPTIONAL });
			expect(schema1.validate(stringArray)).toBe(stringArray);
			const schema2 = ArraySchema.create({ items: NumberSchema.REQUIRED });
			expect(schema2.validate(numberArray)).toBe(numberArray);
		});
		test("Arrays with fixable value are fixed", () => {
			const schema1 = ArraySchema.create({ items: StringSchema.OPTIONAL });
			expect(schema1.validate([1, 2, 3])).toEqual(["1", "2", "3"]);
			const schema2 = ArraySchema.create({ items: NumberSchema.REQUIRED });
			expect(schema2.validate(["1", "2", "3"])).toEqual([1, 2, 3]);
		});
		test("Arrays that do not validate against format (and cannot be converted) are invalid", () => {
			const schema1 = ArraySchema.create({ items: NumberSchema.REQUIRED });
			expect(() => schema1.validate(randomArray)).toThrow(InvalidFeedback);
			const schema2 = ArraySchema.create({ items: StringSchema.OPTIONAL });
			expect(() => schema2.validate(randomArray)).toThrow(InvalidFeedback);
		});
		test("Arrays with errors in format subschemas provide acceItemsSchema those errors via Invalid", () => {
			// Validate and catch Invalids.
			const arr = ["abc", 123, "abc"];
			const schema = ArraySchema.create({ items: NumberSchema.REQUIRED });
			try {
				schema.validate(arr);
				expect(false).toBe(true); // Not reached.
			} catch (invalid: any) {
				expect(invalid).toBeInstanceOf(InvalidFeedback);
				expect(invalid.messages[0]).toBe("Must be number"); // arr[0] failed.
				expect(invalid.messages[2]).toBe("Must be number"); // arr[2] failed.
				expect(Object.keys(invalid.messages).length).toBe(2); // No additional errors (arr[1] paItemsSchema).
			}
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = ArraySchema.create({
				items: StringSchema.REQUIRED,
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate([]);
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
