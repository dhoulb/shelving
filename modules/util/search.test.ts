import { filterArray, MatchAllWords, MatchAnyWord, MATCHES_ALL, MATCHES_ANY, toWordRegExps } from "../index.js";

test("MATCHES_ALL", () => {
	// Search empty query.
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps(""))).toBe(false);

	// Single full words.
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("dog"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("the"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("cat"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("tapir"))).toBe(false);

	// Multiple full words.
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("dog cat"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("the the"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("tapir cat"))).toBe(false);

	// Single partial words.
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("do"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("th"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("ca"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("tap"))).toBe(false);

	// Multiple partial words.
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("do ca"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("th t"))).toBe(true);
	expect(MATCHES_ALL("the dog and the cat", toWordRegExps("tap ca"))).toBe(false);

	// Anything else.
	expect(MATCHES_ALL(123, toWordRegExps("123"))).toBe(false);
	expect(MATCHES_ALL(123, toWordRegExps("123"))).toBe(false);
	expect(MATCHES_ALL(true, toWordRegExps("true"))).toBe(false);
	expect(MATCHES_ALL(true, toWordRegExps("true"))).toBe(false);
});
test("MATCHES_ANY", () => {
	// Search empty query.
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps(""))).toBe(false);

	// Single full words.
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("dog"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("the"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("cat"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("tapir"))).toBe(false);

	// Multiple full words.
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("dog cat"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("the the"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("tapir cat"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("tapir elephant"))).toBe(false);

	// Single partial words.
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("do"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("th"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("ca"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("tap"))).toBe(false);

	// Multiple partial words.
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("do ca"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("th t"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("tap ca"))).toBe(true);
	expect(MATCHES_ANY("the dog and the cat", toWordRegExps("tap ele"))).toBe(false);

	// Anything else.
	expect(MATCHES_ANY(123, toWordRegExps("123"))).toBe(false);
	expect(MATCHES_ANY(123, toWordRegExps("123"))).toBe(false);
	expect(MATCHES_ANY(true, toWordRegExps("true"))).toBe(false);
	expect(MATCHES_ANY(true, toWordRegExps("true"))).toBe(false);
});
test("filter(): Works correctly with MatchAllWords", () => {
	const arr = ["the dog", "the man", "the cat"];
	expect(filterArray(arr, new MatchAllWords("dog"))).toEqual(["the dog"]);
	expect(filterArray(arr, new MatchAllWords("do"))).toEqual(["the dog"]);
	expect(filterArray(arr, new MatchAllWords("man"))).toEqual(["the man"]);
	expect(filterArray(arr, new MatchAllWords("ma"))).toEqual(["the man"]);
	expect(filterArray(arr, new MatchAllWords("man cat"))).toEqual([]);
	expect(filterArray(arr, new MatchAllWords("ma ca"))).toEqual([]);

	// Returs same instance if no filtering needed.
	expect(filterArray(arr, new MatchAllWords("the"))).toEqual(arr);
	expect(filterArray(arr, new MatchAllWords("th"))).toEqual(arr);
});
test("filter(): Works correctly with MatchAnyWord", () => {
	const arr = ["the dog", "the man", "the cat"];
	expect(filterArray(arr, new MatchAnyWord("dog"))).toEqual(["the dog"]);
	expect(filterArray(arr, new MatchAnyWord("do"))).toEqual(["the dog"]);
	expect(filterArray(arr, new MatchAnyWord("man"))).toEqual(["the man"]);
	expect(filterArray(arr, new MatchAnyWord("ma"))).toEqual(["the man"]);
	expect(filterArray(arr, new MatchAnyWord("man cat"))).toEqual(["the man", "the cat"]);
	expect(filterArray(arr, new MatchAnyWord("ma ca"))).toEqual(["the man", "the cat"]);

	// Returs same instance if no filtering needed.
	expect(filterArray(arr, new MatchAnyWord("the"))).toEqual(arr);
	expect(filterArray(arr, new MatchAnyWord("th"))).toEqual(arr);
	expect(filterArray(arr, new MatchAnyWord("dog man cat"))).toEqual(arr);
	expect(filterArray(arr, new MatchAnyWord("do ma ca"))).toEqual(arr);
});
