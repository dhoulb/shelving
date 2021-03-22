import { InvalidFeedback, email, EmailSchema } from "..";

// Tests.
describe("EmailSchema", () => {
	test("TypeScript", () => {
		// Test email.optional
		const s1: EmailSchema<string> = email.optional;
		const r1: string = s1.validate("dave@test.com");

		// Test email.required
		const s2: EmailSchema<string> = email.required;
		const r2: string = s2.validate("dave@test.com");

		// Test email({})
		const s3: EmailSchema<string> = email({});
		const r3: string = s3.validate("dave@test.com");
		const s4: EmailSchema<string> = email({ required: true });
		const r4: string = s4.validate("dave@test.com");
		const s5: EmailSchema<string> = email({ required: false });
		const r5: string = s5.validate("dave@test.com");
		const s6: EmailSchema<string> = email({});
		const r6: string = s6.validate("dave@test.com");

		// Test options.
		const s9: EmailSchema<"dave@test.com"> = email({ options: ["dave@test.com"], required: true });
		const s10: EmailSchema<"dave@test.com" | ""> = email({ options: ["dave@test.com"] });
		const s11: EmailSchema<"dave@test.com"> = email({ options: { "dave@test.com": "ABC" }, required: true });
		const s12: EmailSchema<"dave@test.com" | ""> = email({ options: { "dave@test.com": "ABC" } });
		// @ts-expect-error Type cannot be a subset of `string` unless `options` key is set.
		const s13: EmailSchema<"dave@test.com"> = email({ required: true });
		// @ts-expect-error Type cannot be a subset of `string` unless `options` key is set.
		const s14: EmailSchema<"dave@test.com" | ""> = email({ required: false });
	});
	test("Constructs correctly", () => {
		const schema1 = email({});
		expect(schema1).toBeInstanceOf(EmailSchema);
		expect(schema1.required).toBe(false);
		const schema2 = email.required;
		expect(schema2).toBeInstanceOf(EmailSchema);
		expect(schema2.required).toBe(true);
		const schema3 = email.required;
		expect(schema3).toBeInstanceOf(EmailSchema);
		expect(schema3.required).toBe(true);
	});
	describe("validate()", () => {
		const schema = email({});
		describe("username", () => {
			test("Valid usernames are valid", () => {
				expect(schema.validate("jo@google.com")).toBe("jo@google.com");
				expect(schema.validate("john@google.com")).toBe("john@google.com");
				expect(schema.validate("dave.houlbrooke@google.com")).toBe("dave.houlbrooke@google.com");
				expect(schema.validate("j.i.l.l@google.com")).toBe("j.i.l.l@google.com");
			});
			test("Invalid usernames are invalid", () => {
				expect(() => schema.validate(".jo@google.com")).toThrow(InvalidFeedback);
				expect(() => schema.validate("jo.@google.com")).toThrow(InvalidFeedback);
				expect(() => schema.validate("jo<@google.com")).toThrow(InvalidFeedback);
				expect(() => schema.validate("<jo@google.com")).toThrow(InvalidFeedback);
				expect(() => schema.validate("^*%&@google.com")).toThrow(InvalidFeedback);
			});
		});
		describe("server", () => {
			test("Valid domains are valid", () => {
				expect(schema.validate("jo@google.com")).toBe("jo@google.com");
				expect(schema.validate("jo@x.com")).toBe("jo@x.com");
				expect(schema.validate("jo@bbc.co.uk")).toBe("jo@bbc.co.uk");
				expect(schema.validate("jo@british-library.co.uk")).toBe("jo@british-library.co.uk");
			});
			test("Internationalised (IDN) labels are valid", () => {
				expect(schema.validate("jo@xn--ngbrx.com")).toBe("jo@xn--ngbrx.com");
				expect(schema.validate("jo@xn--ngbrx.co.uk")).toBe("jo@xn--ngbrx.co.uk");
			});
			test("Internationalised (IDN) TLDs are valid", () => {
				expect(schema.validate("jo@a.xn--ngbrx")).toBe("jo@a.xn--ngbrx");
				expect(schema.validate("jo@a.xn--mgbai9azgqp6j")).toBe("jo@a.xn--mgbai9azgqp6j");
				expect(schema.validate("jo@a.xn--vermgensberater-ctb")).toBe("jo@a.xn--vermgensberater-ctb");
			});
			test("Custom TLDs are valid", () => {
				expect(schema.validate("jo@a.datsun")).toBe("jo@a.datsun");
				expect(schema.validate("jo@a.deloitte")).toBe("jo@a.deloitte");
				expect(schema.validate("jo@a.goodhands")).toBe("jo@a.goodhands");
				expect(schema.validate("jo@a.northwesternmutual")).toBe("jo@a.northwesternmutual");
			});
			test("Domain labels with up 63 characters are valid", () => {
				expect(schema.validate("jo@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com")).toBe(
					"jo@abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyzabcdefghijk.com",
				);
			});
			test("Domain labels longer than 63 characters are invalid", () => {
				expect(() => schema.validate("jo@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaax.com")).toThrow(InvalidFeedback);
			});
			test("Domains with less than 2 labels are invalid", () => {
				expect(() => schema.validate("jo@aaa")).toThrow(InvalidFeedback);
				expect(() => schema.validate("jo@a")).toThrow(InvalidFeedback);
			});
			test("TLD with less than two characters is invalid", () => {
				expect(() => schema.validate("jo@aaa.a")).toThrow(InvalidFeedback);
			});
			test("Domains have whitespace trimmed from start/end", () => {
				expect(schema.validate("    jo@google.com   ")).toBe("jo@google.com");
			});
			test("Domains are lowercased", () => {
				expect(schema.validate("JO@GOOGLE.COM")).toBe("jo@google.com");
			});
		});
		test("Email addresses with more than 254 total characters are invalid", () => {
			const v1 =
				"jo@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com";
			expect(() => schema.validate(v1)).toThrow(InvalidFeedback);
			const v2 =
				"jo@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com";
			expect(() => schema.validate(v2)).toThrow(InvalidFeedback);
		});
		test("Email addresses with domain segments longer than 63 characters are invalid", () => {
			const v1 = "jo@aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com";
			expect(() => schema.validate(v1)).toThrow(InvalidFeedback);
		});
		test("Email addresses with missing username or server are invalid", () => {
			expect(() => schema.validate("username@")).toThrow(InvalidFeedback);
			expect(() => schema.validate("@server.com")).toThrow(InvalidFeedback);
		});
		test("Nullish values return empty string", () => {
			expect(schema.validate("")).toBe("");
			expect(schema.validate(null)).toBe("");
			expect(schema.validate(undefined)).toBe("");
			expect(schema.validate(false)).toBe("");
		});
		test("Non-strings are Invalid", () => {
			expect(() => schema.validate([])).toThrow(InvalidFeedback);
			expect(() => schema.validate({})).toThrow(InvalidFeedback);
			expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		});
	});
	describe("options.value", () => {
		test("Undefined returns default default value (empty string)", () => {
			const schema = email({});
			expect(schema.validate(undefined)).toBe("");
		});
		test("Undefined with default value returns default value", () => {
			const schema = email({ value: "jo@x.com" });
			expect(schema.validate(undefined)).toBe("jo@x.com");
		});
	});
	describe("options.required", () => {
		test("Non-required value allows falsy", () => {
			const schema = email({ required: false });
			expect(schema.validate(null)).toBe("");
			expect(schema.validate("")).toBe("");
		});
		test("Required value disallows null", () => {
			const schema = email({ required: true });
			expect(() => schema.validate(null)).toThrow(InvalidFeedback);
			expect(() => schema.validate("")).toThrow(InvalidFeedback);
		});
	});
	describe("options.validator", () => {
		test("Works correctly", () => {
			const feedback = new InvalidFeedback("WORKS");
			const schema = email({
				validator: () => {
					throw feedback;
				},
			});
			try {
				schema.validate("dave@test.com");
				expect(false).toBe(true);
			} catch (thrown) {
				expect(thrown).toBe(feedback);
			}
		});
	});
});
