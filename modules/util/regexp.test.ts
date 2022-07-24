import { filterArray, MatchAllWords, MatchAnyWord, matchesAll, matchesAny, toWordRegExps } from "../index.js";

test("matchesAll", () => {
	// Search empty query.
	expect(matchesAll("the dog and the cat", toWordRegExps(""))).toBe(false);

	// Single full words.
	expect(matchesAll("the dog and the cat", toWordRegExps("dog"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("the"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("cat"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("tapir"))).toBe(false);

	// Multiple full words.
	expect(matchesAll("the dog and the cat", toWordRegExps("dog cat"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("the the"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("tapir cat"))).toBe(false);

	// Single partial words.
	expect(matchesAll("the dog and the cat", toWordRegExps("do"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("th"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("ca"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("tap"))).toBe(false);

	// Multiple partial words.
	expect(matchesAll("the dog and the cat", toWordRegExps("do ca"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("th t"))).toBe(true);
	expect(matchesAll("the dog and the cat", toWordRegExps("tap ca"))).toBe(false);

	// Anything else.
	expect(matchesAll(123, toWordRegExps("123"))).toBe(false);
	expect(matchesAll(123, toWordRegExps("123"))).toBe(false);
	expect(matchesAll(true, toWordRegExps("true"))).toBe(false);
	expect(matchesAll(true, toWordRegExps("true"))).toBe(false);
});
test("matchesAny()", () => {
	// Search empty query.
	expect(matchesAny("the dog and the cat", toWordRegExps(""))).toBe(false);

	// Single full words.
	expect(matchesAny("the dog and the cat", toWordRegExps("dog"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("the"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("cat"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("tapir"))).toBe(false);

	// Multiple full words.
	expect(matchesAny("the dog and the cat", toWordRegExps("dog cat"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("the the"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("tapir cat"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("tapir elephant"))).toBe(false);

	// Single partial words.
	expect(matchesAny("the dog and the cat", toWordRegExps("do"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("th"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("ca"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("tap"))).toBe(false);

	// Multiple partial words.
	expect(matchesAny("the dog and the cat", toWordRegExps("do ca"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("th t"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("tap ca"))).toBe(true);
	expect(matchesAny("the dog and the cat", toWordRegExps("tap ele"))).toBe(false);

	// Anything else.
	expect(matchesAny(123, toWordRegExps("123"))).toBe(false);
	expect(matchesAny(123, toWordRegExps("123"))).toBe(false);
	expect(matchesAny(true, toWordRegExps("true"))).toBe(false);
	expect(matchesAny(true, toWordRegExps("true"))).toBe(false);
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
