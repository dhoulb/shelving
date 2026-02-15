import { describe, expect, test } from "bun:test";
import type { Schema } from "../index.js";
import { ARRAY, ArraySchema, DATA, NUMBER, STRING } from "../index.js";

// Vars.
const stringArray = ["a", "b", "c"];
const numberArray = [1, 2, 3];
const longArray = ["a", "b", "c", "d", "e", "f", "g", "h"];
const nestedArray = [{ title: "abc" }, { title: "def" }, { title: "ghi" }];
const randomArray = [{ a: 1 }, 2, { iii: { three: 3 } }, false];

// Tests.
test("TypeScript", () => {
	const requiredSchema = ARRAY(NUMBER);
	const requiredType: ArraySchema<number> = requiredSchema;
	const requiredValue: ReadonlyArray<number> = requiredSchema.validate([123]);
	const requiredItemsSchema: Schema<number> = requiredSchema.items;

	const arrayRequiredSchema = new ArraySchema({ items: STRING });
	const arrayRequiredType: ArraySchema<string> = arrayRequiredSchema;
	const arrayRequiredv4: ReadonlyArray<string> = arrayRequiredSchema.validate([123]);
	const arrayRequiredItemsSchema: Schema<string> = arrayRequiredSchema.items;
});
test("constructor()", () => {
	const items = STRING;
	const schema1 = new ArraySchema({ items });
	expect(schema1).toBeInstanceOf(ArraySchema);
	expect(schema1.items).toBe(items);
	const schema2 = ARRAY(items);
	expect(schema2).toBeInstanceOf(ArraySchema);
	expect(schema2.items).toBe(items);
});
describe("validate()", () => {
	const schema = new ArraySchema({ items: STRING });
	test("Valid arrays are unchanged (same instance)", () => {
		expect(ARRAY(STRING).validate(stringArray)).toEqual(stringArray);
		expect(ARRAY(NUMBER).validate(numberArray)).toEqual(numberArray);
		expect(ARRAY(STRING).validate(longArray)).toEqual(longArray);
		expect(ARRAY(DATA({ title: STRING })).validate(nestedArray)).toEqual(nestedArray);
	});
	test("Non-arrays are invalid", () => {
		expect(() => schema.validate(123)).toThrow();
		expect(() => schema.validate({})).toThrow();
		expect(() => schema.validate(true)).toThrow();
		expect(() => schema.validate(() => {})).toThrow();
		expect(() => schema.validate(0)).toThrow();
		expect(() => schema.validate(false)).toThrow();
	});
	test("Strings are split", () => {
		expect(schema.validate("abc")).toEqual(["abc"]);
		expect(schema.validate("")).toEqual([]);
		expect(schema.validate("a,b,c")).toEqual(["a", "b", "c"]);
		expect(schema.validate("a,,c")).toEqual(["a", "c"]);
		expect(schema.validate(",a,,c,")).toEqual(["a", "c"]);

		const schema1 = new ArraySchema({ items: STRING, separator: "/" });
		expect(schema1.validate("a/b/c")).toEqual(["a", "b", "c"]);
		expect(schema1.validate("a///b/c")).toEqual(["a", "b", "c"]);

		const schema2 = new ArraySchema({ items: STRING, separator: /[\\/|\- ]/ });
		expect(schema2.validate("a/b-c d|e")).toEqual(["a", "b", "c", "d", "e"]);
	});
});
describe("options.value", () => {
	test("Works correctly and returns same instance", () => {
		const arr = [1, 2, 3];
		const schema = new ArraySchema({ items: NUMBER, value: arr });
		expect(schema.validate(undefined)).toEqual(arr);
	});
	test("Undefined returns empty array", () => {
		const schema = new ArraySchema({ items: STRING });
		expect(schema.validate(undefined)).toEqual([]);
	});
});
describe("options.unique", () => {
	test("Arrays with duplicate items are made unique", () => {
		const schema = new ArraySchema({ items: STRING, unique: true });
		expect(schema.validate(["a", "b", "c", "a"])).toEqual(["a", "b", "c"]);
	});
	test("Arrays without duplicate items return the same instance", () => {
		const arr = ["a", "b", "c"];
		const schema = new ArraySchema({ items: STRING, unique: true });
		expect(schema.validate(arr)).toEqual(arr);
	});
	test("Duplicates are allowed if unique is false", () => {
		const arr = ["a", "b", "c", "a"];
		const schema1 = new ArraySchema({ items: STRING }); // False is the default.
		expect(schema1.validate(arr)).toEqual(arr);
		const schema2 = new ArraySchema({ items: STRING, unique: false });
		expect(schema2.validate(arr)).toEqual(arr);
	});
});
describe("options.max", () => {
	test("Arrays with more items than maximum are invalid", () => {
		const schema = new ArraySchema({ max: 1, items: STRING });
		expect(() => schema.validate(numberArray)).toThrow();
	});
	test("Arrays with leItemsSchema than maximum return unchanged", () => {
		const schema = new ArraySchema({ max: 10, items: NUMBER });
		expect(schema.validate(numberArray)).toEqual(numberArray);
	});
});
describe("options.min", () => {
	test("Arrays with leItemsSchema than minimum are invalid", () => {
		const schema = new ArraySchema({ min: 10, items: STRING });
		expect(() => schema.validate(numberArray)).toThrow();
	});
	test("Arrays with more items than minimum return unchanged", () => {
		const schema = new ArraySchema({ min: 1, items: NUMBER });
		expect(schema.validate(numberArray)).toEqual(numberArray);
	});
});
describe("options.items", () => {
	test("Arrays that validate are unchanged (same instance)", () => {
		const schema1 = new ArraySchema({ items: STRING });
		expect(schema1.validate(stringArray)).toEqual(stringArray);
		const schema2 = new ArraySchema({ items: NUMBER });
		expect(schema2.validate(numberArray)).toEqual(numberArray);
	});
	test("Arrays with fixable value are fixed", () => {
		const schema1 = new ArraySchema({ items: STRING });
		expect(schema1.validate([1, 2, 3])).toEqual(["1", "2", "3"]);
		const schema2 = new ArraySchema({ items: NUMBER });
		expect(schema2.validate(["1", "2", "3"])).toEqual([1, 2, 3]);
	});
	test("Arrays that do not validate against format (and cannot be converted) are invalid", () => {
		const schema1 = new ArraySchema({ items: NUMBER });
		expect(() => schema1.validate(randomArray)).toThrow();
		const schema2 = new ArraySchema({ items: ARRAY(STRING) });
		expect(() => schema2.validate(randomArray)).toThrow();
	});
	test("Arrays with errors in format subschemas provide access to those errors via Invalid", () => {
		// Validate and catch Invalids.
		const arr = ["abc", 123, "def"];
		const schema = new ArraySchema({ items: NUMBER });
		try {
			schema.validate(arr);
			expect(false).toBe(true); // Not reached.
		} catch (invalid: unknown) {
			expect(invalid).toBe("0: Must be number\n2: Must be number");
		}
	});
});
describe("options.one and options.many", () => {
	test("One and many are inherited from items schema", () => {
		const schema = new ArraySchema({ items: NUMBER });
		expect(schema.one).toEqual("number");
		expect(schema.many).toEqual("numbers");
		expect(schema.placeholder).toEqual("No numbers");
	});
});
describe("options.separator", () => {
	test("One and many are inherited from items schema", () => {});
});
