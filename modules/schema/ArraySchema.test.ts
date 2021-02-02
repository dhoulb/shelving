import { InvalidFeedback, Schema, array, string, number, object, ArraySchema } from "..";

// Vars.
const stringArray = ["a", "b", "c"];
const numberArray = [1, 2, 3];
const longArray = ["a", "b", "c", "d", "e", "f", "g", "h"];
const nestedArray = [{ title: "abc" }, { title: "def" }, { title: "ghi" }];
const randomArray = [{ a: 1 }, 2, { iii: { three: 3 } }, false];

// Tests.
describe("ArraySchema", () => {
	test("TypeScript", () => {
		// Test array.optional()
		const optionalSchema = array.optional(number.optional);
		const optionalType: ArraySchema<number | null> = optionalSchema;
		const optionalValue: ReadonlyArray<number | null> = optionalSchema.validate([123]);
		const optionalItemsSchema: Schema<number | null> = optionalSchema.items;
		const optionalItemsValue: number | null = optionalItemsSchema.validate(123);

		// Test array.required()
		const requiredSchema = array.required(number.required);
		const requiredType: ArraySchema<number> = requiredSchema;
		const requiredValue: ReadonlyArray<number> = requiredSchema.validate([123]);
		const requiredItemsSchema: Schema<number> = requiredSchema.items;
		const requiredItemsValue: number = requiredItemsSchema.validate(123);

		// Test array()
		const arrayRequiredSchema = array({ items: string.required, required: true });
		const arrayRequiredType: ArraySchema<string> = arrayRequiredSchema;
		const arrayRequiredv4: ReadonlyArray<string> = arrayRequiredSchema.validate([123]);
		const arrayOptionalSchema = array({ items: string.required, required: false });
		const arrayOptionalType: ArraySchema<string> = arrayOptionalSchema;
		const arrayOptionalv5: ReadonlyArray<string> = arrayOptionalSchema.validate([123]);
		const arrayAutoSchema = array({ items: string.required });
		const arrayAutoType: ArraySchema<string> = arrayAutoSchema;
		const arrayAutov3: ReadonlyArray<string> = arrayAutoSchema.validate([123]);
	});
	test("Constructs correctly", () => {
		const items = string.required;
		const schema1 = array({ items });
		expect(schema1).toBeInstanceOf(ArraySchema);
		expect(schema1.required).toBe(false);
		expect(schema1.items).toBe(items);
		const schema2 = array.required(items);
		expect(schema2).toBeInstanceOf(ArraySchema);
		expect(schema2.required).toBe(true);
		expect(schema2.items).toBe(items);
		const schema3 = array.required(items);
		expect(schema3).toBeInstanceOf(ArraySchema);
		expect(schema3.required).toBe(true);
		expect(schema3.items).toBe(items);
	});
	describe("validate()", () => {
		const schema = array({ items: string.required });
		test("Valid arrays are unchanged (same instance)", () => {
			expect(array.required(string.required).validate(stringArray)).toBe(stringArray);
			expect(array.required(number.required).validate(numberArray)).toBe(numberArray);
			expect(array.required(string.required).validate(longArray)).toBe(longArray);
			expect(array.required(object.required({ title: string.required })).validate(nestedArray)).toBe(nestedArray);
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
			const schema = array({ items: number.required, value: arr });
			expect(schema.validate(undefined)).toBe(arr);
		});
		test("Undefined and falsy returns empty array", () => {
			const schema = array({ items: string.required });
			expect(schema.validate(undefined)).toEqual([]);
			expect(schema.validate(0)).toEqual([]);
			expect(schema.validate(false)).toEqual([]);
			expect(schema.validate("")).toEqual([]);
		});
	});
	describe("options.max", () => {
		test("Arrays with more items than maximum are invalid", () => {
			const schema = array({ max: 1, items: string.required });
			expect(() => schema.validate(numberArray)).toThrow(InvalidFeedback);
		});
		test("Arrays with leItemsSchema than maximum return unchanged", () => {
			const schema = array({ max: 10, items: number.required });
			expect(schema.validate(numberArray)).toBe(numberArray);
		});
	});
	describe("options.min", () => {
		test("Arrays with leItemsSchema than minimum are invalid", () => {
			const schema = array({ min: 10, items: string.required });
			expect(() => schema.validate(numberArray)).toThrow(InvalidFeedback);
		});
		test("Arrays with more items than minimum return unchanged", () => {
			const schema = array({ min: 1, items: number.required });
			expect(schema.validate(numberArray)).toBe(numberArray);
		});
	});
	describe("options.required", () => {
		test("Required empty arrays are invalid", () => {
			const schema = array({ required: true, items: string.required });
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
		});
		test("Required nonempty arrays do not throw", () => {
			const schema = array({ required: true, items: string.required });
			expect(() => schema.validate(numberArray)).not.toThrow();
		});
	});
	describe("options.items", () => {
		test("Arrays that validate are unchanged (same instance)", () => {
			const schema1 = array({ items: string.optional });
			expect(schema1.validate(stringArray)).toBe(stringArray);
			const schema2 = array({ items: number.required });
			expect(schema2.validate(numberArray)).toBe(numberArray);
		});
		test("Arrays with fixable value are fixed", () => {
			const schema1 = array({ items: string.optional });
			expect(schema1.validate([1, 2, 3])).toEqual(["1", "2", "3"]);
			const schema2 = array({ items: number.required });
			expect(schema2.validate(["1", "2", "3"])).toEqual([1, 2, 3]);
		});
		test("Arrays that do not validate against format (and cannot be converted) are invalid", () => {
			const schema1 = array({ items: number.required });
			expect(() => schema1.validate(randomArray)).toThrow(InvalidFeedback);
			const schema2 = array({ items: string.optional });
			expect(() => schema2.validate(randomArray)).toThrow(InvalidFeedback);
		});
		test("Arrays with errors in format subschemas provide acceItemsSchema those errors via Invalid", () => {
			// Validate and catch Invalids.
			const arr = ["abc", 123, "abc"];
			const schema = array({ items: number.required });
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
});
