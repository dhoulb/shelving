import { SEARCH } from "../index.js";

test("SEARCH.WORDS.ALL: Works correctly", () => {
	// Search empty query.
	expect(SEARCH.WORDS.ALL("the dog and the cat", "")).toBe(false);

	// Single full words.
	expect(SEARCH.WORDS.ALL("the dog and the cat", "dog")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "the")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "cat")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "tapir")).toBe(false);

	// Multiple full words.
	expect(SEARCH.WORDS.ALL("the dog and the cat", "dog cat")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "the the")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "tapir cat")).toBe(false);

	// Single partial words.
	expect(SEARCH.WORDS.ALL("the dog and the cat", "do")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "th")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "ca")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "tap")).toBe(false);

	// Multiple partial words.
	expect(SEARCH.WORDS.ALL("the dog and the cat", "do ca")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "th t")).toBe(true);
	expect(SEARCH.WORDS.ALL("the dog and the cat", "tap ca")).toBe(false);

	// Arrays of words.
	expect(SEARCH.WORDS.ALL(["the dog", "the man", "the cat"], "cat")).toBe(true);
	expect(SEARCH.WORDS.ALL(["the dog", "the man", "the cat"], "man")).toBe(true);
	expect(SEARCH.WORDS.ALL(["the dog", "the man", "the cat"], "the")).toBe(true);
	expect(SEARCH.WORDS.ALL(["the dog", "the man", "the cat"], "tapir")).toBe(false);
	expect(SEARCH.WORDS.ALL(["the dog", "the man", "the cat"], "dog cat")).toBe(true);
	expect(SEARCH.WORDS.ALL(["the dog", "the man", "the cat"], "tapir cat")).toBe(false);

	// Objects of words.
	expect(SEARCH.WORDS.ALL({ title: "the dog", type: "man", owns: "cat" }, "cat")).toBe(true);
	expect(SEARCH.WORDS.ALL({ title: "the dog", type: "man", owns: "cat" }, "man")).toBe(true);
	expect(SEARCH.WORDS.ALL({ title: "the dog", type: "man", owns: "cat" }, "the")).toBe(true);
	expect(SEARCH.WORDS.ALL({ title: "the dog", type: "man", owns: "cat" }, "tapir")).toBe(false);
	expect(SEARCH.WORDS.ALL({ title: "the dog", type: "man", owns: "cat" }, "dog cat")).toBe(true);
	expect(SEARCH.WORDS.ALL({ title: "the dog", type: "man", owns: "cat" }, "tapir cat")).toBe(false);

	// Anything else.
	expect(SEARCH.WORDS.ALL(123, "123")).toBe(false);
	expect(SEARCH.WORDS.ALL(123, "123")).toBe(false);
	expect(SEARCH.WORDS.ALL(true, "true")).toBe(false);
	expect(SEARCH.WORDS.ALL(true, "true")).toBe(false);
});
test("SEARCH.WORDS.ANY: Works correctly", () => {
	// Search empty query.
	expect(SEARCH.WORDS.ANY("the dog and the cat", "")).toBe(false);

	// Single full words.
	expect(SEARCH.WORDS.ANY("the dog and the cat", "dog")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "the")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "cat")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "tapir")).toBe(false);

	// Multiple full words.
	expect(SEARCH.WORDS.ANY("the dog and the cat", "dog cat")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "the the")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "tapir cat")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "tapir elephant")).toBe(false);

	// Single partial words.
	expect(SEARCH.WORDS.ANY("the dog and the cat", "do")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "th")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "ca")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "tap")).toBe(false);

	// Multiple partial words.
	expect(SEARCH.WORDS.ANY("the dog and the cat", "do ca")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "th t")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "tap ca")).toBe(true);
	expect(SEARCH.WORDS.ANY("the dog and the cat", "tap ele")).toBe(false);

	// Arrays of words.
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "cat")).toBe(true);
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "man")).toBe(true);
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "the")).toBe(true);
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "tapir")).toBe(false);
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "dog cat")).toBe(true);
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "tapir cat")).toBe(true);
	expect(SEARCH.WORDS.ANY(["the dog", "the man", "the cat"], "tapir elephant")).toBe(false);

	// Objects of words.
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "cat")).toBe(true);
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "man")).toBe(true);
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "the")).toBe(true);
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "tapir")).toBe(false);
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "dog cat")).toBe(true);
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "tapir cat")).toBe(true);
	expect(SEARCH.WORDS.ANY({ title: "the dog", type: "man", owns: "cat" }, "tapir elephant")).toBe(false);

	// Anything else.
	expect(SEARCH.WORDS.ANY(123, "123")).toBe(false);
	expect(SEARCH.WORDS.ANY(123, "123")).toBe(false);
	expect(SEARCH.WORDS.ANY(true, "true")).toBe(false);
	expect(SEARCH.WORDS.ANY(true, "true")).toBe(false);
});
