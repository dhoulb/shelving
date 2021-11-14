import { hasAllWords, hasAnyWord } from "../index.js";

test("matchAllWords(): Works correctly", () => {
	// Search empty query.
	expect(hasAllWords("the dog and the cat", "")).toBe(false);

	// Single full words.
	expect(hasAllWords("the dog and the cat", "dog")).toBe(true);
	expect(hasAllWords("the dog and the cat", "the")).toBe(true);
	expect(hasAllWords("the dog and the cat", "cat")).toBe(true);
	expect(hasAllWords("the dog and the cat", "tapir")).toBe(false);

	// Multiple full words.
	expect(hasAllWords("the dog and the cat", "dog cat")).toBe(true);
	expect(hasAllWords("the dog and the cat", "the the")).toBe(true);
	expect(hasAllWords("the dog and the cat", "tapir cat")).toBe(false);

	// Single partial words.
	expect(hasAllWords("the dog and the cat", "do")).toBe(true);
	expect(hasAllWords("the dog and the cat", "th")).toBe(true);
	expect(hasAllWords("the dog and the cat", "ca")).toBe(true);
	expect(hasAllWords("the dog and the cat", "tap")).toBe(false);

	// Multiple partial words.
	expect(hasAllWords("the dog and the cat", "do ca")).toBe(true);
	expect(hasAllWords("the dog and the cat", "th t")).toBe(true);
	expect(hasAllWords("the dog and the cat", "tap ca")).toBe(false);

	// Arrays of words.
	expect(hasAllWords(["the dog", "the man", "the cat"], "cat")).toBe(true);
	expect(hasAllWords(["the dog", "the man", "the cat"], "man")).toBe(true);
	expect(hasAllWords(["the dog", "the man", "the cat"], "the")).toBe(true);
	expect(hasAllWords(["the dog", "the man", "the cat"], "tapir")).toBe(false);
	expect(hasAllWords(["the dog", "the man", "the cat"], "dog cat")).toBe(true);
	expect(hasAllWords(["the dog", "the man", "the cat"], "tapir cat")).toBe(false);

	// Objects of words.
	expect(hasAllWords({ title: "the dog", type: "man", owns: "cat" }, "cat")).toBe(true);
	expect(hasAllWords({ title: "the dog", type: "man", owns: "cat" }, "man")).toBe(true);
	expect(hasAllWords({ title: "the dog", type: "man", owns: "cat" }, "the")).toBe(true);
	expect(hasAllWords({ title: "the dog", type: "man", owns: "cat" }, "tapir")).toBe(false);
	expect(hasAllWords({ title: "the dog", type: "man", owns: "cat" }, "dog cat")).toBe(true);
	expect(hasAllWords({ title: "the dog", type: "man", owns: "cat" }, "tapir cat")).toBe(false);

	// Anything else.
	expect(hasAllWords(123, "123")).toBe(false);
	expect(hasAllWords(123, "123")).toBe(false);
	expect(hasAllWords(true, "true")).toBe(false);
	expect(hasAllWords(true, "true")).toBe(false);
});
test("matchAnyWord(): Works correctly", () => {
	// Search empty query.
	expect(hasAnyWord("the dog and the cat", "")).toBe(false);

	// Single full words.
	expect(hasAnyWord("the dog and the cat", "dog")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "the")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "cat")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "tapir")).toBe(false);

	// Multiple full words.
	expect(hasAnyWord("the dog and the cat", "dog cat")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "the the")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "tapir cat")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "tapir elephant")).toBe(false);

	// Single partial words.
	expect(hasAnyWord("the dog and the cat", "do")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "th")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "ca")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "tap")).toBe(false);

	// Multiple partial words.
	expect(hasAnyWord("the dog and the cat", "do ca")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "th t")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "tap ca")).toBe(true);
	expect(hasAnyWord("the dog and the cat", "tap ele")).toBe(false);

	// Arrays of words.
	expect(hasAnyWord(["the dog", "the man", "the cat"], "cat")).toBe(true);
	expect(hasAnyWord(["the dog", "the man", "the cat"], "man")).toBe(true);
	expect(hasAnyWord(["the dog", "the man", "the cat"], "the")).toBe(true);
	expect(hasAnyWord(["the dog", "the man", "the cat"], "tapir")).toBe(false);
	expect(hasAnyWord(["the dog", "the man", "the cat"], "dog cat")).toBe(true);
	expect(hasAnyWord(["the dog", "the man", "the cat"], "tapir cat")).toBe(true);
	expect(hasAnyWord(["the dog", "the man", "the cat"], "tapir elephant")).toBe(false);

	// Objects of words.
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "cat")).toBe(true);
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "man")).toBe(true);
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "the")).toBe(true);
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "tapir")).toBe(false);
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "dog cat")).toBe(true);
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "tapir cat")).toBe(true);
	expect(hasAnyWord({ title: "the dog", type: "man", owns: "cat" }, "tapir elephant")).toBe(false);

	// Anything else.
	expect(hasAnyWord(123, "123")).toBe(false);
	expect(hasAnyWord(123, "123")).toBe(false);
	expect(hasAnyWord(true, "true")).toBe(false);
	expect(hasAnyWord(true, "true")).toBe(false);
});
