import { Feedback, StringSchema, Schema, STRING, REQUIRED_STRING } from "../index.js";

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
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
		expect(() => schema.validate([])).toThrow(Feedback);
		expect(() => schema.validate({})).toThrow(Feedback);
		expect(() => schema.validate(() => {})).toThrow(Feedback);
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
		expect(() => schema1.validate("abc")).toThrow(Feedback);
		const schema2 = new StringSchema({ match: /[a-z]/ });
		expect(() => schema2.validate("ABC")).toThrow(Feedback);
	});
});
describe("options.multiline", () => {
	test("String without multiline strips tab and newline", () => {
		const schema1 = new StringSchema({});
		expect(schema1.validate("aaa\0aaa")).toBe("aaaaaa"); // Control character is stripped.
		expect(schema1.validate("aaa\taaa")).toBe("aaa aaa"); // Tab in middle of line is converted to space.
		expect(schema1.validate("aaa\n\taaa")).toBe("aaa aaa"); // Newline + tab at start of line is converted to space.
	});
	test("String with multiline keeps newline", () => {
		const schema1 = new StringSchema({ multiline: true });
		expect(schema1.validate("aaa\0aaa")).toBe("aaaaaa"); // Control character is stripped.
		expect(schema1.validate("aaa\taaa")).toBe("aaa aaa"); // Tab in middle of line is converted to space.
		expect(schema1.validate("aaa\n\taaa")).toBe("aaa\n\taaa"); // Newline + tab at start of line is kept.
	});
});
describe("options.min", () => {
	test("Strings shorter than the minimum are invalid", () => {
		const schema = new StringSchema({ min: 10 });
		expect(() => schema.validate("a")).toThrow(Feedback);
	});
});
describe("options.max", () => {
	test("Strings longer than the maximum are trimmed", () => {
		const schema = new StringSchema({ max: 3 });
		expect(() => schema.validate("abcdef")).toThrow(Feedback);
	});
});
