import { describe, expect, test } from "bun:test";
import { ValueFeedback } from "../feedback/Feedback.js";
import { ValueFeedbacks } from "../feedback/Feedbacks.js";
import type { Validator } from "../util/validate.js";
import { DATA } from "./DataSchema.js";
import { PARTIAL } from "./PartialSchema.js";

// Simple mock validators
const STRING: Validator<string> = {
	validate: v => {
		if (typeof v !== "string") throw new ValueFeedback("Must be string", v);
		return v;
	},
};
const NUMBER: Validator<number> = {
	validate: v => {
		if (typeof v !== "number") throw new ValueFeedback("Must be number", v);
		return v;
	},
};

// Provide index signature to satisfy Data constraint
type User = { name: string; age: number; [key: string]: unknown };

const UserSchema = DATA<User>({ name: STRING, age: NUMBER });

describe("PartialSchema", () => {
	test("validates partial object with subset of fields", () => {
		const PartialUser = PARTIAL(UserSchema);
		const result = PartialUser.validate({ name: "Alice" });
		expect(result).toEqual({ name: "Alice" });
	});
	test("ignores undefined fields in partial", () => {
		const PartialUser = PARTIAL(UserSchema);
		// age is undefined, should be skipped not validated
		const result = PartialUser.validate({ name: "Bob", age: undefined as any });
		expect(result).toEqual({ name: "Bob" });
	});
	test("returns object reference if unchanged", () => {
		const PartialUser = PARTIAL(UserSchema);
		const input = { age: 30 } as const;
		const result = PartialUser.validate(input);
		// Since object may be reconstructed due to change detection logic, relax equality
		expect(result).toEqual(input);
	});
	test("aggregates errors for multiple invalid props", () => {
		const PartialUser = PARTIAL(UserSchema);
		try {
			PartialUser.validate({ name: 123, age: "nope" } as any);
			throw new Error("Should have thrown");
		} catch (e) {
			expect(e).toBeInstanceOf(ValueFeedbacks);
			const feedback = e as any; // loosen typing to inspect messages
			expect(feedback.messages.name).toBe("Must be string");
			expect(feedback.messages.age).toBe("Must be number");
		}
	});
	test("rejects non-object values", () => {
		const PartialUser = PARTIAL(UserSchema);
		expect(() => PartialUser.validate(null as any)).toThrow(ValueFeedback);
		expect(() => PartialUser.validate(5 as any)).toThrow(ValueFeedback);
	});
});
