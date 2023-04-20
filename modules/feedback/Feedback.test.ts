import { Feedback } from "../index.js";

test("Feedback", () => {
	// Check props.
	expect(new Feedback("AAA", "BBB")).toEqual({ message: "AAA", value: "BBB" });
});
