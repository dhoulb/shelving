import { Feedback, InvalidFeedback, StringSchema, Schema, STRING, REQUIRED_STRING } from "../index.js";

// Vars.
const longString =
	"Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus.";

// Tests.
test("TypeScript", () => {
	// Test string.optional
	const schema1: Schema<string | null> = STRING;
	const schemaResult1: string | null = schema1.validate("ABC");

	// Test string.required
	const schema2: Schema<string> = REQUIRED_STRING;
	const schemaResult2: string = schema2.validate("ABC");

	// Test string({})
	const schema4: StringSchema = new StringSchema({});
	const schemaResult4: string = schema4.validate("ABC");
});
test("constructor()", () => {
	const schema1 = new StringSchema({});
	expect(schema1).toBeInstanceOf(StringSchema);
	const schema2 = REQUIRED_STRING;
	expect(schema2).toBeInstanceOf(StringSchema);
	const schema3 = STRING;
	expect(schema3).toBeInstanceOf(StringSchema);
});
describe("validate()", () => {
	const schema = new StringSchema({});
	test("Strings pass through unchanged", () => {
		expect(schema.validate(longString)).toBe(longString);
		expect(schema.validate("abcdef")).toBe("abcdef");
	});
	test("Strings are converted to strings", () => {
		expect(schema.validate(1)).toBe("1");
		expect(schema.validate(123)).toBe("123");
		expect(schema.validate(100039384)).toBe("100039384");
	});
	test("Non-strings (except numbers) throw Invalid", () => {
		expect(() => schema.validate(null)).toThrow(InvalidFeedback);
		expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		expect(() => schema.validate([])).toThrow(InvalidFeedback);
		expect(() => schema.validate({})).toThrow(InvalidFeedback);
		expect(() => schema.validate(() => {})).toThrow(InvalidFeedback);
	});
});
describe("options.default", () => {
	test("Undefined returns empty string", () => {
		const schema = new StringSchema({});
		expect(schema.validate(undefined)).toBe("");
	});
	test("Undefined with default returns default value", () => {
		const schema = new StringSchema({ value: "abc" });
		expect(schema.validate(undefined)).toBe("abc");
	});
});
describe("options.match", () => {
	test("String with match must match format", () => {
		const schema1 = new StringSchema({ match: /[a-z]+/ });
		expect(schema1.validate("abc")).toBe("abc");
		const schema2 = new StringSchema({ match: /[0-9]+/ });
		expect(schema2.validate("038203")).toBe("038203");
	});
	test("String not matching format returns Invalid", () => {
		const schema1 = new StringSchema({ match: /[0-9]+/ });
		expect(() => schema1.validate("abc")).toThrow(InvalidFeedback);
		const schema2 = new StringSchema({ match: /[a-z]/ });
		expect(() => schema2.validate("ABC")).toThrow(InvalidFeedback);
	});
});
describe("options.multiline", () => {
	test("Control characters are stripped", () => {
		const schema1 = new StringSchema({});
		const value1 =
			"abc\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9Fdef";
		expect(schema1.validate(value1)).toBe("abcdef");
	});
	test("String without multiline strips tab and line feed newline", () => {
		const schema1 = new StringSchema({});
		expect(schema1.validate("abc\t\ndef")).toBe("abcdef");
	});
	test("String with multiline keeps tab and line feed newline", () => {
		const schema1 = new StringSchema({ multiline: true });
		expect(schema1.validate("ab\t\x0Bcd\n\x0Cef")).toBe("ab\tcd\nef");
		const value1 =
			"\tabc\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0B\x0C\x0D\x0E\x0F\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1A\x1B\x1C\x1D\x1E\x1F\x7F\x80\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8A\x8B\x8C\x8D\x8E\x8F\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F  def";
		expect(schema1.validate(value1)).toBe("\tabc\n  def");
	});
});
describe("options.min", () => {
	test("Strings shorter than the minimum are invalid", () => {
		const schema = new StringSchema({ min: 10 });
		expect(() => schema.validate("a")).toThrow(InvalidFeedback);
	});
});
describe("options.max", () => {
	test("Strings longer than the maximum are trimmed", () => {
		const schema = new StringSchema({ max: 3 });
		expect(() => schema.validate("abcdef")).toThrow(InvalidFeedback);
	});
});
