import { filterArray, getAllRegExp, getAnyRegExp, isMatch, notMatch } from "../index.js";

test("getAllRegExp()", () => {
	// No pattern (always true).
	expect(getAllRegExp([]).test("")).toBe(true);
	expect(getAllRegExp([]).test("the dog and the cat")).toBe(true);

	// Array with one pattern.
	expect(getAllRegExp(["dog"]).test("the dog and the cat")).toBe(true);
	expect(getAllRegExp(["cat"]).test("the dog and the cat")).toBe(true);
	expect(getAllRegExp(["tapir"]).test("the dog and the cat")).toBe(false);

	// Array with multiple pattern.
	expect(getAllRegExp(["dog", "cat"]).test("the dog and the cat")).toBe(true);
	expect(getAllRegExp(["the", "the"]).test("the dog and the cat")).toBe(true);
	expect(getAllRegExp(["tapir", "cat"]).test("the dog and the cat")).toBe(false);
});
test("getAnyRegExp()", () => {
	// No pattern (always false).
	expect(getAnyRegExp([]).test("")).toBe(false);
	expect(getAnyRegExp([]).test("the dog and the cat")).toBe(false);

	// Array with one pattern.
	expect(getAnyRegExp(["dog"]).test("the dog and the cat")).toBe(true);
	expect(getAnyRegExp(["cat"]).test("the dog and the cat")).toBe(true);
	expect(getAnyRegExp(["tapir"]).test("the dog and the cat")).toBe(false);

	// Array with multiple pattern.
	expect(getAnyRegExp(["dog", "cat"]).test("the dog and the cat")).toBe(true);
	expect(getAnyRegExp(["tapir", "cat"]).test("the dog and the cat")).toBe(true);
	expect(getAnyRegExp(["tapir", "elephant"]).test("the dog and the cat")).toBe(false);
});
test("isMatch()", () => {
	const arr = ["the dog", "the man", "the cat"];

	expect(filterArray(arr, isMatch, /dog/)).toEqual(["the dog"]);
	expect(filterArray(arr, isMatch, /man/)).toEqual(["the man"]);
	expect(filterArray(arr, isMatch, /tapir/)).toEqual([]);
	expect(filterArray(arr, isMatch, /man|cat/)).toEqual(["the man", "the cat"]);

	// Returs same instance if no filtering needed.
	expect(filterArray(arr, isMatch, /the/)).toBe(arr);
	expect(filterArray(arr, isMatch, /dog|man|cat/)).toBe(arr);
});
test("notMatch()", () => {
	const arr = ["the dog", "the man", "the cat"];

	expect(filterArray(arr, notMatch, /dog/)).toEqual(["the man", "the cat"]);
	expect(filterArray(arr, notMatch, /man/)).toEqual(["the dog", "the cat"]);
	expect(filterArray(arr, notMatch, /man|cat/)).toEqual(["the dog"]);
	expect(filterArray(arr, notMatch, /the/)).toEqual([]);
	expect(filterArray(arr, notMatch, /dog|man|cat/)).toEqual([]);

	// Returs same instance if no filtering needed.
	expect(filterArray(arr, notMatch, /tapir/)).toBe(arr);
});
