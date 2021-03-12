import { SEARCH } from "..";

test("SEARCH.WORDS: Works correctly", () => {
	// Single full words.
	expect(SEARCH.WORDS("the dog and the cat", "dog")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "the")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "cat")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "tapir")).toBe(false);

	// Multiple full words.
	expect(SEARCH.WORDS("the dog and the cat", "dog cat")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "the the")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "tapir cat")).toBe(false);

	// Single partial words.
	expect(SEARCH.WORDS("the dog and the cat", "do")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "th")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "ca")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "tap")).toBe(false);

	// Multiple partial words.
	expect(SEARCH.WORDS("the dog and the cat", "do ca")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "th t")).toBe(true);
	expect(SEARCH.WORDS("the dog and the cat", "tap ca")).toBe(false);

	// Arrays of words.
	expect(SEARCH.WORDS(["the dog", "the man", "the cat"], "cat")).toBe(true);
	expect(SEARCH.WORDS(["the dog", "the man", "the cat"], "man")).toBe(true);
	expect(SEARCH.WORDS(["the dog", "the man", "the cat"], "the")).toBe(true);
	expect(SEARCH.WORDS(["the dog", "the man", "the cat"], "tapir")).toBe(false);
	expect(SEARCH.WORDS(["the dog", "the man", "the cat"], "dog cat")).toBe(true);
	expect(SEARCH.WORDS(["the dog", "the man", "the cat"], "tapir cat")).toBe(false);

	// Objects of words.
	expect(SEARCH.WORDS({ title: "the dog", type: "man", owns: "cat" }, "cat")).toBe(true);
	expect(SEARCH.WORDS({ title: "the dog", type: "man", owns: "cat" }, "man")).toBe(true);
	expect(SEARCH.WORDS({ title: "the dog", type: "man", owns: "cat" }, "the")).toBe(true);
	expect(SEARCH.WORDS({ title: "the dog", type: "man", owns: "cat" }, "tapir")).toBe(false);
	expect(SEARCH.WORDS({ title: "the dog", type: "man", owns: "cat" }, "dog cat")).toBe(true);
	expect(SEARCH.WORDS({ title: "the dog", type: "man", owns: "cat" }, "tapir cat")).toBe(false);

	// Anything else.
	expect(SEARCH.WORDS(123, "123")).toBe(false);
	expect(SEARCH.WORDS(123, "123")).toBe(false);
	expect(SEARCH.WORDS(true, "true")).toBe(false);
	expect(SEARCH.WORDS(true, "true")).toBe(false);
});
