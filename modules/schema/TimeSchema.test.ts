import { Feedback, TIME, TimeSchema } from "../index.js";

test("constructor()", () => {
	const schema1 = new TimeSchema({});
	expect(schema1).toBeInstanceOf(TimeSchema);
	const schema3 = TIME;
	expect(schema3).toBeInstanceOf(TimeSchema);
});
describe("validate()", () => {
	const schema = new TimeSchema({});
	test("Strings are parsed correctly", () => {
		// Date strings.
		expect(typeof schema.validate("now")).toBe("string");
		expect(schema.validate("today")).toBe("00:00:00.000");
		expect(schema.validate("2022-12-20 20:22")).toBe("20:22:00.000");
	});
	test("Numbers are converted to strings", () => {
		expect(typeof schema.validate(1)).toBe("string");
		expect(typeof schema.validate(123)).toBe("string");
		expect(typeof schema.validate(100039384)).toBe("string");
	});
	test("Non-strings (except numbers) throw Invalid", () => {
		expect(() => schema.validate(null)).toThrow(Feedback);
		expect(() => schema.validate(false)).toThrow(Feedback);
		expect(() => schema.validate(true)).toThrow(Feedback);
		expect(() => schema.validate([])).toThrow(Feedback);
		expect(() => schema.validate({})).toThrow(Feedback);
	});
});
