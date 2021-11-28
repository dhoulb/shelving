import { InvalidFeedback, EmailSchema, Schema, Feedback, REQUIRED_EMAIL, OPTIONAL_EMAIL } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<string | null> = OPTIONAL_EMAIL;
	const r1: string | null | Feedback = s1.validate("dave@test.com");

	const s2: Schema<string> = REQUIRED_EMAIL;
	const r2: string | Feedback = s2.validate("dave@test.com");

	const s3: Schema<string> = new EmailSchema({});
	const r3: string | Feedback = s3.validate("dave@test.com");
	const s4: Schema<string> = new EmailSchema({ required: true });
	const r4: string | Feedback = s4.validate("dave@test.com");
	const s5: Schema<string> = new EmailSchema({ required: false });
	const r5: string | Feedback = s5.validate("dave@test.com");
	const s6: Schema<string> = new EmailSchema({});
	const r6: string | Feedback = s6.validate("dave@test.com");
});
test("constructor()", () => {
	const schema1 = new EmailSchema({});
	expect(schema1).toBeInstanceOf(EmailSchema);
	const schema2 = REQUIRED_EMAIL;
	expect(schema2).toBeInstanceOf(EmailSchema);
	const schema3 = REQUIRED_EMAIL;
	expect(schema3).toBeInstanceOf(EmailSchema);
});
describe("validate()", () => {
	const schema = new EmailSchema({});
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
	test("Non-strings are invalid", () => {
		expect(() => schema.validate([])).toThrow(InvalidFeedback);
		expect(() => schema.validate({})).toThrow(InvalidFeedback);
		expect(() => schema.validate(true)).toThrow(InvalidFeedback);
		expect(() => schema.validate(null)).toThrow(InvalidFeedback);
		expect(() => schema.validate("")).toThrow(InvalidFeedback);
	});
});
describe("options.value", () => {
	test("Undefined with default value returns default value", () => {
		const schema = new EmailSchema({ value: "jo@x.com" });
		expect(schema.validate(undefined)).toBe("jo@x.com");
	});
});
