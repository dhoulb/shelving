import { InvalidFeedback, getYmd, DateSchema } from "../index.js";

// Tests.
describe("DateSchema", () => {
	test("TypeScript", () => {
		const s1: DateSchema<string | null> = DateSchema.OPTIONAL;
		const r1: string | null = s1.validate("2015-09-12");

		const s2: DateSchema<string> = DateSchema.REQUIRED;
		const r2: string = s2.validate("2015-09-12");

		const s3: DateSchema<string | null> = DateSchema.create({});
		const r3: string | null = s3.validate("2015-09-12");
		const s4: DateSchema<string> = DateSchema.create({ required: true });
		const r4: string = s4.validate("2015-09-12");
		const s5: DateSchema<string | null> = DateSchema.create({ required: false });
		const r5: string | null = s5.validate("2015-09-12");
		const s6: DateSchema<string | null> = DateSchema.create({});
		const r6: string | null = s6.validate("2015-09-12");
	});
	test("Constructs correctly", () => {
		const schema1 = DateSchema.create({});
		expect(schema1).toBeInstanceOf(DateSchema);
		expect(schema1.required).toBe(false);
		const schema2 = DateSchema.REQUIRED;
		expect(schema2).toBeInstanceOf(DateSchema);
		expect(schema2.required).toBe(true);
		const schema3 = DateSchema.REQUIRED;
		expect(schema3).toBeInstanceOf(DateSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = DateSchema.create({});
		test("Date instances are converted to strings", () => {
			const d1 = new Date("2018-08-09");
			expect(schema.validate(d1)).toBe("2018-08-09");
			const d2 = new Date(0);
			expect(schema.validate(d2)).toBe("1970-01-01");
			const d3 = new Date("1998");
			expect(schema.validate(d3)).toBe("1998-01-01");
		});
		test("Falsy values are converted to null", () => {
			expect(schema.validate(null)).toBe(null);
			expect(schema.validate("")).toBe(null);
			expect(schema.validate(false)).toBe(null);
		});
		test("Strings are converted to YMD date strings", () => {
			expect(schema.validate("    1995-12-17    ")).toBe("1995-12-17");
			expect(schema.validate("1995-12-17T03:24:00")).toBe("1995-12-17");
			expect(schema.validate("December 17, 1995 03:24:00")).toBe("1995-12-17");
			expect(schema.validate("1995-11-18")).toBe("1995-11-18");
		});
		test("Invalid strings are invalid", () => {
			expect(() => schema.validate("abc")).toThrow(InvalidFeedback);
			expect(() => schema.validate("7 1995")).toThrow(InvalidFeedback);
		});
		test("Numbers are converted to YMD date strings", () => {
			expect(schema.validate(0)).toEqual("1970-01-01");
			expect(schema.validate(1530586357000)).toEqual("2018-07-03");
		});
		test("Infinite numbers are invalid", () => {
			expect(() => schema.validate(Infinity)).toThrow(InvalidFeedback);
			expect(() => schema.validate(-Infinity)).toThrow(InvalidFeedback);
		});
		test("Invalid values are invalid", () => {
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		});
	});
	describe("options.value", () => {
		test("Undefined with no value returns null", () => {
			const schema = DateSchema.create({});
			expect(schema.validate(undefined)).toEqual(null);
		});
		test("Undefined with default value returns default value", () => {
			const schema1 = DateSchema.create({ value: "1995" });
			expect(schema1.validate(undefined)).toEqual("1995-01-01");
			const schema2 = DateSchema.create({ value: 1530586357000 });
			expect(schema2.validate(undefined)).toEqual("2018-07-03");
			const schema3 = DateSchema.create({ value: new Date("1995") });
			expect(schema3.validate(undefined)).toEqual("1995-01-01");
		});
		test("Using `Date.now` as a default value returns now() as value", () => {
			const schema = DateSchema.create({ value: Date.now });
			expect(schema.validate(undefined)).toBe(getYmd(new Date()));
		});
	});
	describe("options.required", () => {
		test("Non-required but falsy dates return null", () => {
			const schema = DateSchema.create({});
			expect(schema.validate(undefined)).toBe(null);
			expect(schema.validate(false)).toBe(null);
			expect(schema.validate(null)).toBe(null);
		});
		test("Required but falsy dates return Required", () => {
			const schema = DateSchema.create({ required: true });
			expect(() => schema.validate(undefined)).toThrow(InvalidFeedback);
			expect(() => schema.validate(false)).toThrow(InvalidFeedback);
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
		});
	});
	describe("options.min", () => {
		test("Date outside minimum is invalid", () => {
			const schema1 = DateSchema.create({ min: new Date("2016") });
			expect(schema1.validate("2016")).toBe("2016-01-01");
			expect(() => schema1.validate("2015")).toThrow(InvalidFeedback);
			const schema2 = DateSchema.create({ min: "2016-01-01" });
			expect(schema2.validate("2016")).toBe("2016-01-01");
			expect(() => schema2.validate("2015")).toThrow(InvalidFeedback);
			const schema3 = DateSchema.create({ min: new Date(1530586357001) });
			expect(schema3.validate(1530586357001)).toBe("2018-07-03");
			expect(() => schema3.validate(1530586357000)).toThrow(InvalidFeedback);
		});
	});
	describe("options.max", () => {
		test("Date outside maximum is invalid", () => {
			const schema1 = DateSchema.create({ max: new Date("2016") });
			expect(schema1.validate("2016")).toBe("2016-01-01");
			expect(() => schema1.validate("2017")).toThrow(InvalidFeedback);
			const schema2 = DateSchema.create({ max: new Date(1530586357000) });
			expect(schema2.validate(1530586357000)).toBe("2018-07-03");
			expect(() => schema2.validate(1530586357001)).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = DateSchema.create({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("1997-04-04");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
