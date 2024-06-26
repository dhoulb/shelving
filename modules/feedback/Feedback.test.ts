import { expect, test } from "bun:test";
import { Feedback, ValueFeedback } from "../index.js";

test("Feedback", () => {
	// Check props.
	expect(new Feedback("AAA")).toEqual({ message: "AAA" });
});
test("ValueFeedback", () => {
	// Check props.
	expect(new ValueFeedback("AAA", "BBB")).toEqual({ message: "AAA", value: "BBB" });
});
