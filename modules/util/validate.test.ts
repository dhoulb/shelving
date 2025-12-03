import { describe, expect, test } from "bun:test";
import {
	Feedback,
	NUMBER,
	OPTIONAL,
	RequiredError,
	requireValid,
	STRING,
	StringSchema,
	ValueFeedback,
	validateArray,
	validateData,
	validateDictionary,
	validateItems,
} from "../index.js";

const VALIDATORS = {
	str: STRING,
	opt: new StringSchema({ value: "abc" }),
	num: NUMBER,
} as const;

describe("getValid()", () => {
	const numValidator = NUMBER;
	test("returns validated value", () => {
		const value = requireValid("123", numValidator);
		expect(value).toBe(123);
	});
	test("throws ValueError with Feedback cause on invalid value", () => {
		try {
			requireValid("abc", numValidator);
			expect("reached").toBe("unreachable");
		} catch (err) {
			expect(err).toBeInstanceOf(RequiredError);
			expect((err as RequiredError).message).toBe("Must be number");
			// Cause chain includes Feedback.
			expect((err as any).cause).toBeInstanceOf(Feedback);
		}
	});
});
describe("validateData()", () => {
	test("applies default values when partial = false", () => {
		const input = { str: "hello", num: 42 };
		const output = validateData(input, VALIDATORS);
		expect(output).toEqual({ str: "hello", opt: "abc", num: 42 });
		// Current implementation always returns a new object (changed flag starts true)
		expect(output).not.toBe(input);
	});
	test("aggregates multiple validation errors", () => {
		const bad = { str: null, opt: false, num: "NaN" };
		try {
			validateData(bad, VALIDATORS);
			expect("should not reach").toBe("reached");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueFeedback);
			// Expected messages based on existing schema message patterns
			expect(err).toEqual(new ValueFeedback("str: Must be string\nopt: Must be string\nnum: Must be number", bad));
		}
	});
	test("removes excess fields when rebuilding object (default added)", () => {
		const input: any = { str: "hello", num: 5, extra: "remove" };
		const output = validateData(input, VALIDATORS);
		expect(output).toEqual({ str: "hello", opt: "abc", num: 5 });
		expect((output as any).extra).toBeUndefined();
		expect(output).not.toBe(input); // new object created because default applied
	});
	test("removes excess fields", () => {
		const input: any = { extra: "remove" };
		const output = validateData(input, {});
		expect(output).toEqual({});
		expect("extra" in output).toBe(false);
		expect(output).not.toBe(input); // new object created because default applied
	});
	test("returns same object even when values already valid (current behavior)", () => {
		const input = { str: "alpha", opt: "abc", num: 7 } as const;
		const output = validateData(input, VALIDATORS);
		expect(output).toEqual(input);
		expect(output).toBe(input); // unchanged object should be returned
	});
	test("Undefined fields are stripped from the output", () => {
		const props = { a: STRING, b: OPTIONAL(STRING) };
		const output = validateData({ a: "Bob", b: undefined }, props);
		expect(output).toEqual({ a: "Bob" } as any);
		expect(Object.hasOwn(output, "b")).toBe(false);
		expect("b" in output).toBe(false);
	});
});
describe("validateItems()", () => {
	test("yields converted items and throws aggregated errors after iteration when any invalid", () => {
		try {
			Array.from(validateItems([1, "2", "bad"], NUMBER));
			expect("reached").toBe("unreachable");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueFeedback);
			expect(err).toEqual(new ValueFeedback("2: Must be number", [1, "2", "bad"]));
		}
	});
	test("all valid items (with coercion) returned as array via spread", () => {
		const out = [...validateItems([1, "2", 3], NUMBER)];
		expect(out).toEqual([1, 2, 3]);
	});
});
describe("validateArray()", () => {
	test("returns new array with coerced values", () => {
		const arr = [1, "2", 3];
		const out = validateArray(arr, NUMBER);
		expect(out).toEqual([1, 2, 3]);
		expect(out).not.toBe(arr); // changed flag starts true hence new array
	});
	test("returns same array when unchanged", () => {
		const arr = [1, 2, 3];
		const out = validateArray(arr, NUMBER);
		expect(out).toBe(arr);
	});
	test("aggregates element errors", () => {
		const arr = [1, "2", "x"];
		try {
			validateArray(arr, NUMBER);
			expect("reached").toBe("unreachable");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueFeedback);
			expect(err).toEqual(new ValueFeedback("2: Must be number", arr));
		}
	});
});
describe("validateDictionary()", () => {
	test("returns same object reference when unchanged", () => {
		const dict = { a: 1, b: 2 } as const;
		const out = validateDictionary(dict, NUMBER);
		expect(out).toBe(dict); // unchanged & not iterable so original reused
	});
	test("returns new object when any value changes (coercion)", () => {
		const dict: Record<string, unknown> = { a: 1, b: "2" };
		const out = validateDictionary(dict, NUMBER);
		expect(out).toEqual({ a: 1, b: 2 });
		expect(out).not.toBe(dict);
	});
	test("returns same object reference when no value changes", () => {
		const dict: Record<string, unknown> = { a: 1, b: 2, c: 3 };
		const out = validateDictionary(dict, NUMBER);
		expect(dict).toBe(out);
	});
	test("aggregates value errors", () => {
		const dict: Record<string, unknown> = { a: 1, b: "x", c: 3 };
		try {
			validateDictionary(dict, NUMBER);
			expect("reached").toBe("unreachable");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueFeedback);
			expect(err).toEqual(new ValueFeedback("b: Must be number", dict));
		}
	});
});
