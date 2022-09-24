import { TimeSchema, TIME, OPTIONAL_TIME, InvalidFeedback } from "../index.js";
import { TIME_REGEXP } from "../util/time.js";

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
		expect(schema.validate("now")).toMatch(TIME_REGEXP);
		expect(schema.validate("today")).toBe("00:00:00.000");
		expect(schema.validate("2022-12-20 20:22")).toBe("20:22:00.000");
	});
	test("Numbers are converted to strings", () => {
		expect(schema.validate(1)).toMatch(TIME_REGEXP);
		expect(schema.validate(123)).toMatch(TIME_REGEXP);
		expect(schema.validate(100039384)).toMatch(TIME_REGEXP);
	});
	test("Non-strings (except numbers) throw Invalid", () => {
		expect(() => schema.validate(null)).toThrow(InvalidFeedback);
		expect(() => schema.validate(false)).toThrow(InvalidFeedback);
		expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		expect(() => schema.validate([])).toThrow(InvalidFeedback);
		expect(() => schema.validate({})).toThrow(InvalidFeedback);
	});
});
