import { Feedback, Feedbacks } from "../index.js";

test("Feedbacks", () => {
	const one = new Feedback("ONE");
	const two = new Feedback("TWO");
	// Check props.
	const feedbacks = new Feedbacks({ one, two });
	expect(feedbacks.feedbacks.one).toBe(one);
	expect(feedbacks.feedbacks.two).toBe(two);
	expect(feedbacks.message).toEqual("ONE");
	expect(feedbacks.messages).toEqual({ one: "ONE", two: "TWO" });
});
