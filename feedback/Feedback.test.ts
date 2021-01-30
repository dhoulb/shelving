import { Feedback, SuccessFeedback, InvalidFeedback, WarningFeedback } from ".";

describe("Feedback", () => {
	test("Constructs correctly", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1).toBeInstanceOf(Feedback);
		expect(feedback1.message).toBe("ABC");
		expect(feedback1.details).toBe(undefined);
		const feedback2 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		expect(feedback2).toBeInstanceOf(Feedback);
		expect(feedback2.message).toBe("ABC");
		expect(feedback2.details?.a).toBeInstanceOf(Feedback);
		expect(feedback2.details?.a?.message).toBe("A");
		expect(feedback2.details?.a?.details).toBe(undefined);
		expect(feedback2.details?.b).toBeInstanceOf(Feedback);
		expect(feedback2.details?.b?.message).toBe("B");
		expect(feedback2.details?.b?.details).toBe(undefined);
	});
	test(".details", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1.details).toEqual(undefined);
		const feedback2 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		expect(feedback2.details).toEqual({ a: new Feedback("A"), b: new Feedback("B") });
	});
	test(".messages", () => {
		const feedback1 = new Feedback("ABC");
		expect(feedback1.messages).toEqual(undefined);
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
	describe("JSON", () => {
		// Simple.
		const feedback0 = new Feedback("ABC");
		const json0 = { message: "ABC" };

		// Details.
		const feedback1 = new Feedback("ABC", { a: new Feedback("A"), b: new Feedback("B") });
		const json1 = { message: "ABC", details: { a: { message: "A" }, b: { message: "B" } } };

		// Deep details.
		const feedback2 = new Feedback("ABC", { a: new Feedback("A", { a1: new Feedback("A1"), a2: new Feedback("A2") }) });
		const json2 = { message: "ABC", details: { a: { message: "A", details: { a1: { message: "A1" }, a2: { message: "A2" } } } } };

		// Different types.
		const feedback3 = new SuccessFeedback("ABC");
		const json3 = { status: "success", message: "ABC" };

		// Different type and deep details.
		const feedback4 = new SuccessFeedback("ABC", { a: new InvalidFeedback("A", { a1: new WarningFeedback("A1"), a2: new Feedback("A2") }) });
		const json4 = {
			status: "success",
			message: "ABC",
			details: { a: { message: "A", status: "invalid", details: { a1: { status: "warning", message: "A1" }, a2: { message: "A2" } } } },
		};

		test("JSON.stringify(): Works correctly", () => {
			expect(JSON.parse(JSON.stringify(feedback0))).toEqual(json0);
			expect(JSON.parse(JSON.stringify(feedback1))).toEqual(json1);
			expect(JSON.parse(JSON.stringify(feedback2))).toEqual(json2);
			expect(JSON.parse(JSON.stringify(feedback3))).toEqual(json3);
			expect(JSON.parse(JSON.stringify(feedback4))).toEqual(json4);
		});
		test(".fromJSON(): Works correctly", () => {
			expect(Feedback.fromJSON(json0)).toEqual(feedback0);
			expect(Feedback.fromJSON(json1)).toEqual(feedback1);
			expect(Feedback.fromJSON(json2)).toEqual(feedback2);
			expect(Feedback.fromJSON(json3)).toEqual(feedback3);
			expect(Feedback.fromJSON(json4)).toEqual(feedback4);
			expect(Feedback.fromJSON(JSON.stringify(json0))).toEqual(feedback0);
			expect(Feedback.fromJSON(JSON.stringify(json1))).toEqual(feedback1);
			expect(Feedback.fromJSON(JSON.stringify(json2))).toEqual(feedback2);
			expect(Feedback.fromJSON(JSON.stringify(json3))).toEqual(feedback3);
			expect(Feedback.fromJSON(JSON.stringify(json4))).toEqual(feedback4);
		});
		test(".fromJSON(): Errors correctly", () => {
			expect(() => Feedback.fromJSON({ message: 123 })).toThrow(SyntaxError); // Message not a string.
			expect(() => Feedback.fromJSON({ message: "A", status: "NOPE" })).toThrow(SyntaxError); // Status not a valid status.
			expect(() => Feedback.fromJSON("abc")).toThrow(SyntaxError); // Invalid JSON stirng.
			expect(() => Feedback.fromJSON("{")).toThrow(SyntaxError); // Invalid JSON stirng.
			expect(() => Feedback.fromJSON(`{"message":123}`)).toThrow(SyntaxError); // Message not a string.
			expect(() => Feedback.fromJSON(`{"message":"A","status":"NOPE"}`)).toThrow(SyntaxError); // Status not a valid status.
		});
	});
});
