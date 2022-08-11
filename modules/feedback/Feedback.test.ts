import { Feedback, getFeedbackMessages } from "../index.js";

test("Feedback", () => {
	// Check props.
	expect(new Feedback("AAA", "BBB")).toEqual({ message: "AAA", value: "BBB" });

	// Check name.
	expect(new Feedback("AAA", "BBB").name).toEqual("Feedback");
});
test("getFeedbackMessages()", () => {
	expect(getFeedbackMessages(new Feedback("AAA", { a: "A", b: new Feedback("B"), c: 123 }))).toEqual({ b: "B" });
});
