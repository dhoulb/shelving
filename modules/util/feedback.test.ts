import { Feedback, SuccessFeedback, InvalidFeedback, WarningFeedback, ErrorFeedback } from "../index.js";
import { AssertionError } from "./error.js";

describe("Feedback", () => {
	test("Constructs correctly", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1).toBeInstanceOf(Feedback);
		expect(feedback1.feedback).toBe("ABC");
		expect(feedback1.details).toEqual({});
		const feedback2 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		expect(feedback2).toBeInstanceOf(Feedback);
		expect(feedback2.feedback).toBe("ABC");
		expect(feedback2.details).toEqual({ a: new Feedback("A"), b: new Feedback("B") });
	});
	test(".details", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1.details).toEqual({});
		const feedback2 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		expect(feedback2.details).toEqual({ a: new Feedback("A"), b: new Feedback("B") });
	});
	test(".messages", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1.messages).toEqual({});
		const feedback2 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		expect(feedback2.messages).toEqual({ a: "A", b: "B" });
	});
	test(".toString()", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1.toString()).toEqual("ABC");
		const feedback2 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		expect(feedback2.toString()).toEqual("ABC\n- a: A\n- b: B");
		const feedback3 = new Feedback("ABC", { a: new Feedback("A", { a1: new Feedback("A1"), a2: new Feedback("A2") }), b: new Feedback("B") });
		expect(feedback3.toString()).toEqual("ABC\n- a: A\n  - a1: A1\n  - a2: A2\n- b: B");
	});
});
