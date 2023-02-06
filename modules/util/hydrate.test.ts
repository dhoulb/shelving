import { UPDATE_HYDRATIONS, Increment, FEEDBACK_HYDRATIONS, SuccessFeedback, InvalidFeedback, dehydrate, hydrate, ImmutableObject, Feedback } from "../index.js";

const HYDRATIONS = {
	...UPDATE_HYDRATIONS,
	...FEEDBACK_HYDRATIONS,
};

test("hydrate(): Works correctly with class instances", () => {
	// Flat.
	const original1 = new Increment(1);
	const dehydrated1 = dehydrate(original1, HYDRATIONS);
	expect(dehydrated1).not.toBe(original1);
	const hydrated1 = hydrate(dehydrated1, HYDRATIONS);
	expect(hydrated1).toBeInstanceOf(Increment);
	expect(original1).not.toBe(hydrated1);
	expect(original1).toEqual(hydrated1);

	// Deep.
	const original2 = new SuccessFeedback("abc", {
		invalid: new InvalidFeedback("def"),
		success: new SuccessFeedback("def"),
		map: new Map([
			["a", 1],
			["b", 2],
		]),
		set: new Set([1, 2, 3]),
		date: new Date("2008-01-01"),
	});
	const dehydrated2 = dehydrate(original2, HYDRATIONS) as typeof original2;
	const hydrated2 = hydrate(dehydrated2, HYDRATIONS) as typeof original2;
	expect(hydrated2).toBeInstanceOf(SuccessFeedback);
	expect(original2).not.toBe(hydrated2);
	expect(original2).toEqual(hydrated2);
	expect(original2.value.invalid).not.toBe(hydrated2.value.invalid);
	expect(original2.value.success).not.toBe(hydrated2.value.success);
	expect(original2.value.map).not.toBe(hydrated2.value.map);
	expect(original2.value.set).not.toBe(hydrated2.value.set);
	expect(original2.value.date).not.toBe(hydrated2.value.date);
});
test("hydrate(): Works correctly with arrays of objects", () => {
	// Flat.
	const original1 = ["abc", new Increment(1), 123] as const;
	const dehydrated1 = dehydrate(original1, HYDRATIONS) as typeof original1;
	const hydrated1 = hydrate(dehydrated1, HYDRATIONS) as typeof original1;
	expect(hydrated1[1]).toBeInstanceOf(Increment);
	expect(original1).not.toBe(hydrated1);
	expect(original1).toEqual(hydrated1);

	// Deep.
	const original2 = [
		"abc",
		123,
		new SuccessFeedback("abc", {
			invalid: new InvalidFeedback("def"),
			success: new SuccessFeedback("def"),
		}),
		new Map([
			["a", 1],
			["b", 2],
		]),
		new Set([1, 2, 3]),
		new Date("2008-01-01"),
	] as const;
	const dehydrated2 = dehydrate(original2, HYDRATIONS) as typeof original2;
	const hydrated2 = hydrate(dehydrated2, HYDRATIONS) as typeof original2;
	expect(hydrated2[2]).toBeInstanceOf(SuccessFeedback);
	expect(hydrated2[3]).toBeInstanceOf(Map);
	expect(hydrated2[4]).toBeInstanceOf(Set);
	expect(hydrated2[5]).toBeInstanceOf(Date);
	expect(original2).not.toBe(hydrated2);
	expect(original2).toEqual(hydrated2);
	expect(original2[2].value.invalid).not.toBe(hydrated2[2].value.invalid);
	expect(original2[2].value.success).not.toBe(hydrated2[2].value.success);
	expect(original2[3]).not.toBe(hydrated2[3]);
	expect(original2[4]).not.toBe(hydrated2[4]);
	expect(original2[5]).not.toBe(hydrated2[5]);

	// Same.
	const original3 = ["a", "b"] as const;
	const dehydrated3 = dehydrate(original3, HYDRATIONS);
	const hydrated3 = hydrate(dehydrated3, HYDRATIONS);
	expect(original3).toEqual(hydrated3);
});
test("hydrate(): Works correctly with plain objects of objects", () => {
	// Flat.
	const original1 = { str: "abc", obj: new Increment(1), num: 123 };
	const dehydrated1 = dehydrate(original1, HYDRATIONS) as typeof original1;
	const hydrated1 = hydrate(dehydrated1, HYDRATIONS) as typeof original1;
	expect(hydrated1.obj).toBeInstanceOf(Increment);
	expect(original1).toEqual(hydrated1);
	expect(original1).not.toBe(hydrated1);

	// Deep.
	const original2 = {
		str: "abc",
		feedback: new SuccessFeedback("abc", {
			invalid: new InvalidFeedback("def"),
			success: new SuccessFeedback("def"),
		}),
		num: 123,
		map: new Map([
			["a", 1],
			["b", 2],
		]),
		set: new Set([1, 2, 3]),
		date: new Date("2008-01-01"),
	};
	const dehydrated2 = dehydrate(original2, HYDRATIONS) as typeof original2;
	expect(dehydrated2).not.toBe(original2);
	const hydrated2 = hydrate(dehydrated2, HYDRATIONS) as typeof original2;
	expect(hydrated2.feedback).toBeInstanceOf(SuccessFeedback);
	expect(original2).toEqual(hydrated2);
	expect(original2).not.toBe(hydrated2);
	expect(original2.map).not.toBe(hydrated2.map);
	expect(original2.set).not.toBe(hydrated2.set);
	expect(original2.date).not.toBe(hydrated2.date);
	expect(original2.feedback).not.toBe(hydrated2.feedback);
	expect(original2.feedback.value.invalid).not.toBe(hydrated2.feedback.value.invalid);
	expect(original2.feedback.value.success).not.toBe(hydrated2.feedback.value.success);

	// Same.
	const original3 = { str: "abc", num: 123 };
	const dehydrated3 = dehydrate(original3, HYDRATIONS);
	const hydrated3 = hydrate(dehydrated3, HYDRATIONS);
	expect(original3).toEqual(hydrated3);
});
