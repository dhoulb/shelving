import { Feedback, Feedbacks } from "../index.js";

test("Feedbacks", () => {
	const one = new Feedback("1");
	const two = new Feedback("2");
	// Check props.
	const feedbacks = new Feedbacks({ one, two });
	expect(feedbacks.feedbacks.one).toBe(one);
	expect(feedbacks.feedbacks.two).toBe(two);
	expect(feedbacks.message).toEqual("one: 1\ntwo: 2");
	expect(feedbacks.messages).toEqual({ one: "1", two: "2" });
});
