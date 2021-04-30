import { InvalidFeedback, schema as shortcuts, StringSchema } from "..";

// Vars.
const longString =
	"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.";

// Tests.
describe("StringSchema", () => {
	test("TypeScript", () => {
		// Test string.optional
		const schema1: StringSchema<string> = shortcuts.string.optional;
		const schemaResult1: string = schema1.validate("ABC");

		// Test string.required
		const schema2: StringSchema<string> = shortcuts.string.required;
		const schemaResult2: string = schema2.validate("ABC");

		// Test string({})
		const schema3: StringSchema<string> = shortcuts.string({ required: false });
		const schemaResult3: string = schema3.validate("ABC");
		const schema4: StringSchema<string> = shortcuts.string({});
		const schemaResult4: string = schema4.validate("ABC");
		const schema5: StringSchema<string> = shortcuts.string({});
		const schemaResult5: string = schema5.validate("ABC");
		const schema6: StringSchema<string> = shortcuts.string({ required: true });
		const schemaResult6: string = schema6.validate("ABC");

		// Test options on string({})
		const schema9: StringSchema<"abc"> = shortcuts.string({ options: ["abc"], required: true });
		const schema10: StringSchema<"abc" | ""> = shortcuts.string({ options: ["abc"] });
		const schema11: StringSchema<"abc"> = shortcuts.string({ options: { abc: "ABC" }, required: true });
		const schema12: StringSchema<"abc" | ""> = shortcuts.string({ options: { abc: "ABC" } });
		// @ts-expect-error Type cannot be a subset of `string` unless `options` key is set.
		const schema13: StringSchema<"abc"> = shortcuts.string({ required: true });
		// @ts-expect-error Type cannot be a subset of `string` unless `options` key is set.
		const schema14: StringSchema<"abc" | ""> = shortcuts.string({ required: false });
		// @ts-expect-error Error because `options.options` is missing so it doesn't match any overload.
		const schema15 = shortcuts.string<"abc" | "">({ required: false });
		// @ts-expect-error Error because `options.options` specifies an incorrect value.
		const schema16 = shortcuts.string<"abc" | "">({ required: false, options: ["def"] });
	});
	test("Constructs correctly", () => {
		const schema1 = shortcuts.string({});
		expect(schema1).toBeInstanceOf(StringSchema);
		expect(schema1.required).toBe(false);
		const schema2 = shortcuts.string.required;
		expect(schema2).toBeInstanceOf(StringSchema);
		expect(schema2.required).toBe(true);
		const schema3 = shortcuts.string.required;
		expect(schema3).toBeInstanceOf(StringSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = shortcuts.string({});
		test("Strings pass through unchanged", () => {
			expect(schema.validate(longString)).toBe(longString);
			expect(schema.validate("abcdef")).toBe("abcdef");
		});
		test("Strings are converted to strings", () => {
			expect(schema.validate(1)).toBe("1");
			expect(schema.validate(123)).toBe("123");
			expect(schema.validate(100039384)).toBe("100039384");
		});
		test("Falsy values return empty string", () => {
			expect(schema.validate(null)).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Non-strings (except numbers) throw Invalid", () => {
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate(() => {})).toThrow(InvalidFeedback);
		});
	});
	describe("options.default", () => {
		test("Undefined returns empty string", () => {
			const schema = shortcuts.string({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with default returns default value", () => {
			const schema = shortcuts.string({ value: "abc" });
			expect(schema.validate(undefined)).toBe("abc");
		});
	});
	describe("options.required", () => {
		test("Required empty strings return Required", () => {
			const schema = shortcuts.string({ required: true });
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
		});
		test("Required non-empty strings are not invalid", () => {
			const schema = shortcuts.string({ required: true });
			expect(schema.validate("abc")).toBe("abc");
		});
		test("Non-required empty strings do not return Required", () => {
			const schema = shortcuts.string({ required: false });
			expect(schema.validate("")).toBe("");
		});
	});
	describe("options.match", () => {
		test("String with match must match format", () => {
			const schema1 = shortcuts.string({ match: /[a-z]+/ });
			expect(schema1.validate("abc")).toBe("abc");
			const schema2 = shortcuts.string({ match: /[0-9]+/ });
			expect(schema2.validate("038203")).toBe("038203");
		});
		test("String not matching format returns Invalid", () => {
			const schema1 = shortcuts.string({ match: /[0-9]+/ });
			expect(() => schema1.validate("abc")).toThrow(InvalidFeedback);
			const schema2 = shortcuts.string({ match: /[a-z]/ });
			expect(() => schema2.validate("ABC")).toThrow(InvalidFeedback);
		});
	});
	describe("options.multiline", () => {
		test("Control characters are stripped", () => {
			const schema1 = shortcuts.string({ trim: false });
			const value1 =
				"abc\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fdef";
			expect(schema1.validate(value1)).toBe("abcdef");
		});
		test("String without multiline strips tab and line feed newline", () => {
			const schema1 = shortcuts.string({ trim: false });
			expect(schema1.validate("abc\t\ndef")).toBe("abcdef");
		});
		test("String with multiline keeps tab and line feed newline", () => {
			const schema1 = shortcuts.string({ multiline: true, trim: false });
			expect(schema1.validate("ab\x09\x0Bcd\x0A\x0Cef")).toBe("ab\tcd\nef");
			const value1 =
				"abc\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0A\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fdef";
			expect(schema1.validate(value1)).toBe("abc\t\ndef");
		});
	});
	describe("options.trim", () => {
		test("String with trim trims the string", () => {
			const schema1 = shortcuts.string({ trim: true });
			expect(schema1.validate("    abc    ")).toBe("abc");
			const schema2 = shortcuts.string({}); // true is the default.
			expect(schema2.validate("    abc    ")).toBe("abc");
		});
		test("String with trim and multiline trims the ends of each line", () => {
			const schema1 = shortcuts.string({ multiline: true, trim: true });
			expect(schema1.validate("    aaa    \n    bbb    ")).toBe("    aaa\n    bbb");
			const schema2 = shortcuts.string({ multiline: true }); // true is the default.
			expect(schema2.validate("    aaa    \n    bbb    ")).toBe("    aaa\n    bbb");
		});
	});
	describe("options.min", () => {
		test("Strings shorter than the minimum are invalid", () => {
			const schema = shortcuts.string({ min: 10 });
			expect(() => schema.validate("a")).toThrow(InvalidFeedback);
		});
	});
	describe("options.max", () => {
		test("Strings longer than the maximum are trimmed", () => {
			const schema = shortcuts.string({ max: 3 });
			expect(() => schema.validate("abcdef")).toThrow(InvalidFeedback);
		});
	});
	describe("options.options", () => {
		test("Any value is allowed by default", () => {
			const schema = shortcuts.string({});
			expect(schema.validate("abc")).toBe("abc");
		});
		test("Value is allowed if it exists in array options", () => {
			const schema = shortcuts.string({ options: ["a", "b", "c"] });
			expect(schema.validate("a")).toBe("a");
		});
		test("Invalid if value doesn't exist in array options", () => {
			const schema = shortcuts.string({ options: ["a", "b", "c"] });
			expect(() => schema.validate("d")).toThrow(InvalidFeedback);
		});
		test("Value is allowed if it exists in object options", () => {
			const schema = shortcuts.string({ options: { a: "A", b: "B", c: "C" } });
			expect(schema.validate("a")).toBe("a");
		});
		test("Invalid if value doesn't exist in object options", () => {
			const schema = shortcuts.string({ options: { a: "A", b: "B", c: "C" } });
			expect(() => schema.validate("d")).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = shortcuts.string({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("a");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
