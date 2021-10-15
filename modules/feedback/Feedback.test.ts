import { Feedback, SuccessFeedback, InvalidFeedback, WarningFeedback, ErrorFeedback } from "../index.js";
import { AssertionError } from "../errors/index.js";

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
	describe("Creating and parsing", () => {
		// Simple.
		const feedback0 = new Feedback("ABC");
		const json0 = { feedback: "ABC" };

		// Details.
		const feedback1 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		const json1 = { feedback: "ABC", details: { a: { feedback: "A", status: "" }, b: { feedback: "B" } } };

		// Deep details.
		const feedback2 = new Feedback("ABC", { a: new Feedback("A", { a1: new Feedback("A1"), a2: new Feedback("A2") }) });
		const json2 = { feedback: "ABC", details: { a: { feedback: "A", details: { a1: { feedback: "A1" }, a2: { feedback: "A2" } } } } };

		// Different types.
		const feedback3 = new SuccessFeedback("ABC");
		const json3 = { status: "success", feedback: "ABC" };

		// Different type and deep details.
		const feedback4 = new ErrorFeedback("ABC", {
			a: new InvalidFeedback("A", {
				a1: new WarningFeedback("A1"),
				a2: new InvalidFeedback("A2"),
			}),
		});
		const json4 = {
			status: "error",
			feedback: "ABC",
			details: {
				a: {
					feedback: "A",
					status: "invalid",
					details: {
						a1: {
							status: "warning",
							feedback: "A1",
						},
						a2: {
							feedback: "A2",
							// status: "invalid" // Should inherit status from its parent.
						},
					},
				},
			},
		};

		test("JSON.stringify(): Works correctly", () => {
			expect(JSON.parse(JSON.stringify(feedback0))).toMatchObject(json0);
			expect(JSON.parse(JSON.stringify(feedback1))).toMatchObject(json1);
			expect(JSON.parse(JSON.stringify(feedback2))).toMatchObject(json2);
			expect(JSON.parse(JSON.stringify(feedback3))).toMatchObject(json3);
			expect(JSON.parse(JSON.stringify(feedback4))).toMatchObject(json4);
		});
		test(".create(): Works correctly", () => {
			expect(Feedback.create(json0)).toEqual(feedback0);
			expect(Feedback.create(json1)).toEqual(feedback1);
			expect(Feedback.create(json2)).toEqual(feedback2);
			expect(Feedback.create(json3)).toEqual(feedback3);
			expect(Feedback.create(json4)).toEqual(feedback4);
			expect(Feedback.create("abc")).toEqual(new Feedback("abc"));
			expect(ErrorFeedback.create("abc")).toEqual(new ErrorFeedback("abc"));
			expect(InvalidFeedback.create("abc")).toEqual(new InvalidFeedback("abc"));
			expect(SuccessFeedback.create("abc")).toEqual(new SuccessFeedback("abc"));
			expect(WarningFeedback.create("abc")).toEqual(new WarningFeedback("abc"));
		});
		test(".create(): Errors correctly", () => {
			expect(() => Feedback.create({ feedback: 123 } as any)).toThrow(AssertionError); // Message not a string.
			expect(() => Feedback.create({ feedback: "A", status: "NOPE" } as any)).toThrow(AssertionError); // Status not a valid status.
		});
	});
});
