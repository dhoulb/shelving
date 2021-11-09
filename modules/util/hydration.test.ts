import {
	TRANSFORM_HYDRATIONS,
	IncrementTransform,
	AddItemsTransform,
	RemoveItemsTransform,
	AddEntriesTransform,
	RemoveEntriesTransform,
	FEEDBACK_HYDRATIONS,
	Feedback,
	SuccessFeedback,
	WarningFeedback,
	ErrorFeedback,
	InvalidFeedback,
	dehydrate,
	hydrate,
} from "../index.js";

const HYDRATIONS = {
	...TRANSFORM_HYDRATIONS,
	...FEEDBACK_HYDRATIONS,
};

test("hydrate(): Works correctly with class instances", () => {
	// Flat.
	const original1 = new IncrementTransform(1);
	const dehydrated1 = dehydrate(original1, HYDRATIONS);
	const hydrated1 = hydrate(dehydrated1, HYDRATIONS);
	expect(hydrated1).toBeInstanceOf(IncrementTransform);
	expect(original1).not.toBe(hydrated1);
	expect(original1).toEqual(hydrated1);

	// Deep.
	const original2 = new SuccessFeedback("abc", {
		invalid: new InvalidFeedback("def"),
		success: new SuccessFeedback("def"),
	});
	const dehydrated2 = dehydrate(original2, HYDRATIONS);
	const hydrated2 = hydrate(dehydrated2, HYDRATIONS);
	expect(hydrated2).toBeInstanceOf(SuccessFeedback);
	expect(original2).not.toBe(hydrated2);
	expect(original2).toEqual(hydrated2);
	expect((original2 as typeof original2).details.invalid).not.toBe((hydrated2 as typeof original2).details.invalid);
	expect((original2 as typeof original2).details.invalid).toEqual((hydrated2 as typeof original2).details.invalid);
	expect((original2 as typeof original2).details.success).not.toBe((hydrated2 as typeof original2).details.success);
	expect((original2 as typeof original2).details.success).toEqual((hydrated2 as typeof original2).details.success);
});
test("hydrate(): Works correctly with arrays of objects", () => {
	// Flat.
	const original1 = ["abc", new IncrementTransform(1), 123] as const;
	const dehydrated1 = dehydrate(original1, HYDRATIONS);
	const hydrated1 = hydrate(dehydrated1, HYDRATIONS);
	expect((hydrated1 as typeof original1)[1]).toBeInstanceOf(IncrementTransform);
	expect(original1).not.toBe(hydrated1);
	expect(original1).toEqual(hydrated1);

	// Deep.
	const original2 = [
		"abc",
		new SuccessFeedback("abc", {
			invalid: new InvalidFeedback("def"),
			success: new SuccessFeedback("def"),
		}),
		123,
	] as const;
	const dehydrated2 = dehydrate(original2, HYDRATIONS);
	const hydrated2 = hydrate(dehydrated2, HYDRATIONS);
	expect((hydrated2 as typeof original2)[1]).toBeInstanceOf(SuccessFeedback);
	expect(original2).not.toBe(hydrated2);
	expect(original2).toEqual(hydrated2);
	expect((original2 as typeof original2)[1].details.invalid).not.toBe((hydrated2 as typeof original2)[1].details.invalid);
	expect((original2 as typeof original2)[1].details.invalid).toEqual((hydrated2 as typeof original2)[1].details.invalid);
	expect((original2 as typeof original2)[1].details.success).not.toBe((hydrated2 as typeof original2)[1].details.success);
	expect((original2 as typeof original2)[1].details.success).toEqual((hydrated2 as typeof original2)[1].details.success);

	// Same.
	const original3 = ["a", "b"] as const;
	const dehydrated3 = dehydrate(original3, HYDRATIONS);
	const hydrated3 = hydrate(dehydrated3, HYDRATIONS);
	expect(original3).toBe(hydrated3);
});
test("hydrate(): Works correctly with plain objects of objects", () => {
	// Flat.
	const original1 = { str: "abc", obj: new IncrementTransform(1), num: 123 };
	const dehydrated1 = dehydrate(original1, HYDRATIONS);
	const hydrated1 = hydrate(dehydrated1, HYDRATIONS);
	expect((hydrated1 as typeof original1).obj).toBeInstanceOf(IncrementTransform);
	expect(original1).not.toBe(hydrated1);
	expect(original1).toEqual(hydrated1);

	// Deep.
	const original2 = {
		str: "abc",
		obj: new SuccessFeedback("abc", {
			invalid: new InvalidFeedback("def"),
			success: new SuccessFeedback("def"),
		}),
		num: 123,
	};
	const dehydrated2 = dehydrate(original2, HYDRATIONS);
	expect(dehydrated2).not.toBe(original2);
	const hydrated2 = hydrate(dehydrated2, HYDRATIONS);
	expect((hydrated2 as typeof original2).obj).toBeInstanceOf(SuccessFeedback);
	expect(original2).not.toBe(hydrated2);
	expect(original2).toEqual(hydrated2);
	expect((original2 as typeof original2).obj.details.invalid).toEqual((hydrated2 as typeof original2).obj.details.invalid);
	expect((original2 as typeof original2).obj.details.invalid).not.toBe((hydrated2 as typeof original2).obj.details.invalid);
	expect((original2 as typeof original2).obj.details.success).toEqual((hydrated2 as typeof original2).obj.details.success);
	expect((original2 as typeof original2).obj.details.success).not.toBe((hydrated2 as typeof original2).obj.details.success);

	// Same.
	const original3 = { str: "abc", num: 123 };
	const dehydrated3 = dehydrate(original3, HYDRATIONS);
	const hydrated3 = hydrate(dehydrated3, HYDRATIONS);
	expect(original3).toBe(hydrated3);
});
