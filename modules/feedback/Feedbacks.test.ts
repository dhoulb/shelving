import { Feedbacks } from "../index.js";

test("Feedbacks", () => {
	// Check props.
	const feedbacks = new Feedbacks({ one: "ONE", two: "TWO" });
	expect(feedbacks.messages.one).toBe("ONE");
	expect(feedbacks.messages.two).toBe("TWO");
	expect(feedbacks.message).toEqual("Multiple errors");
	expect(feedbacks.messages).toEqual({ one: "ONE", two: "TWO" });
});
