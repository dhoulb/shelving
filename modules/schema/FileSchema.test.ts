import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { FILE, FileSchema, NULLABLE_FILE } from "../index.js";

// Tests.
test("TypeScript", () => {
	const s1: Schema<string | null> = NULLABLE_FILE;
	const r1: string | null = s1.validate("test.xml");

	const s2: Schema<string> = FILE;
	const r2: string = s2.validate("test.xml");

	const s3: Schema<string> = new FileSchema({});
	const r3: string = s3.validate("test.xml");
});
test("constructor()", () => {
	const schema1 = new FileSchema({});
	expect(schema1).toBeInstanceOf(FileSchema);
	const schema2 = FILE;
	expect(schema2).toBeInstanceOf(FileSchema);
	const schema3 = FILE;
	expect(schema3).toBeInstanceOf(FileSchema);
});
describe("validate()", () => {
	describe("FileSchema without types", () => {
		const schema = new FileSchema({});
		test("Valid files are valid", () => {
			expect(schema.validate("file.txt")).toBe("file.txt");
			expect(schema.validate("file.xml")).toBe("file.xml");
		});
		test("Invalid files are invalid", () => {
			expect(() => schema.validate("file")).toThrow();
			expect(() => schema.validate("file.")).toThrow();
		});
	});
	describe("FileSchema with types", () => {
		const schema = new FileSchema({ types: { txt: "text/plain", xml: "application/xml" } });
		test("Valid files are valid", () => {
			expect(schema.validate("file.txt")).toBe("file.txt");
			expect(schema.validate("file.xml")).toBe("file.xml");
		});
		test("Invalid files are invalid for format reasons", () => {
			expect(() => schema.validate("file")).toThrow();
			expect(() => schema.validate("file.")).toThrow();
		});
		test("Invalid files are invalid for type reasons", () => {
			expect(() => schema.validate("file.js")).toThrow();
			expect(() => schema.validate("file.png")).toThrow();
		});
	});
});
describe("options.value", () => {
	test("Undefined with default value returns default value", () => {
		const schema = new FileSchema({ value: "file.txt" });
		expect(schema.validate(undefined)).toBe("file.txt");
	});
});
