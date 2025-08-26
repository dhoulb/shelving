import { describe, expect, test } from "bun:test";
import {
	Feedback,
	NUMBER,
	STRING,
	StringSchema,
	ValueError,
	ValueFeedbacks,
	getValid,
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
		const value = getValid("123", numValidator);
		expect(value).toBe(123);
	});
	test("throws ValueError with Feedback cause on invalid value", () => {
		try {
			getValid("abc", numValidator);
			expect("reached").toBe("unreachable");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueError);
			expect((err as ValueError).message).toBe("Must be number");
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
	test("skips missing fields (including defaults) when partial = true", () => {
		const input = { str: "hello" };
		const output = validateData(input, VALIDATORS, true);
		expect(output).toEqual({ str: "hello" });
	});
	test("aggregates multiple validation errors", () => {
		const bad = { str: null, opt: false, num: "NaN" };
		try {
			validateData(bad, VALIDATORS);
			expect("should not reach").toBe("reached");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueFeedbacks);
			// Expected messages based on existing schema message patterns
			expect(err).toEqual(
				new ValueFeedbacks(
					{
						str: "Must be string",
						opt: "Must be string",
						num: "Must be number",
					},
					bad,
				),
			);
		}
	});
	test("removes excess fields when rebuilding object (default added)", () => {
		const input: any = { str: "hello", num: 5, extra: "remove" };
		const output = validateData(input, VALIDATORS);
		expect(output).toEqual({ str: "hello", opt: "abc", num: 5 });
		expect((output as any).extra).toBeUndefined();
		expect(output).not.toBe(input); // new object created because default applied
	});
	describe("deep partial propagation", () => {
		// Nested validators: a has default, b is number
		const nestedValidators = {
			a: new StringSchema({ value: "AAA" }),
			b: NUMBER,
		};
		// Custom nested validator leveraging validateData so we can observe deep-partial behavior
		const NestedValidator = {
			validate(value: unknown) {
				if (!value || typeof value !== "object") throw new Feedback("Must be object");
				// Do not pass partial flag explicitly; rely on ambient isDeeplyPartial
				return validateData(value as any, nestedValidators);
			},
		};
		const parentValidators = {
			id: STRING,
			nested: NestedValidator,
		};
		test("full (partial = false) fills nested defaults", () => {
			const input = { id: "x", nested: { b: 2 } };
			const output = validateData(input, parentValidators);
			expect(output).toEqual({ id: "x", nested: { a: "AAA", b: 2 } });
		});
		test("partial = true skips nested defaults", () => {
			const input = { id: "x", nested: { b: 2 } };
			const output = validateData(input, parentValidators, true);
			expect(output).toEqual({ id: "x", nested: { b: 2 } });
		});
	});
	test("returns same object even when values already valid (current behavior)", () => {
		const input = { str: "alpha", opt: "abc", num: 7 } as const;
		const output = validateData(input, VALIDATORS);
		expect(output).toEqual(input);
		expect(output).toBe(input); // unchanged object should be returned
	});
});
describe("validateItems()", () => {
	test("yields converted items and throws aggregated errors after iteration when any invalid", () => {
		try {
			Array.from(validateItems([1, "2", "bad"], NUMBER));
			expect("reached").toBe("unreachable");
		} catch (err) {
			expect(err).toBeInstanceOf(ValueFeedbacks);
			expect(err).toEqual(new ValueFeedbacks({ 2: "Must be number" }, [1, "2", "bad"]));
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
			expect(err).toBeInstanceOf(ValueFeedbacks);
			expect(err).toEqual(new ValueFeedbacks({ 2: "Must be number" }, arr));
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
			expect(err).toBeInstanceOf(ValueFeedbacks);
			expect(err).toEqual(new ValueFeedbacks({ b: "Must be number" }, dict));
		}
	});
});
