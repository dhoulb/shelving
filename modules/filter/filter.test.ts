import { filter, MATCH, SEARCH } from "..";

test("filter(): Works correctly with MATCH", () => {
	// Filters correctly.
	expect(filter(["a", "b", "c"], MATCH.IS, "b")).toEqual(["b"]);
	expect(filter(["a", "b", "c"], MATCH.NOT, "b")).toEqual(["a", "c"]);
	expect(filter(["a", "b", "c"], MATCH.IN, ["c", "b"])).toEqual(["b", "c"]);
	expect(filter([1, 2, 3], MATCH.GT, 2)).toEqual([3]);
	expect(filter([1, 2, 3], MATCH.GTE, 2)).toEqual([2, 3]);
	expect(filter([1, 2, 3], MATCH.LTE, 2)).toEqual([1, 2]);
	expect(filter([1, 2, 3], MATCH.LT, 2)).toEqual([1]);
	expect(filter(["a", "b", "c"], MATCH.GT, "b")).toEqual(["c"]);
	expect(filter(["a", "b", "c"], MATCH.GTE, "b")).toEqual(["b", "c"]);
	expect(filter(["a", "b", "c"], MATCH.LTE, "b")).toEqual(["a", "b"]);
	expect(filter(["a", "b", "c"], MATCH.LT, "b")).toEqual(["a"]);
	expect(filter([[1, 2, 3],  [4, 5, 6],  [6, 7, 8]], MATCH.CONTAINS, 5)).toEqual([[4, 5, 6]]); // prettier-ignore

	// Returns same instance if no filtering needed.
	const arr = ["a", "b", "c"];
	expect(filter(arr, MATCH.IN, ["c", "a", "b"])).toBe(arr);
});
test("filter(): Works correctly with SEARCH.WORDS.ALL", () => {
	const arr = ["the dog", "the man", "the cat"];
	expect(filter(arr, SEARCH.WORDS.ALL, "dog")).toEqual(["the dog"]);
	expect(filter(arr, SEARCH.WORDS.ALL, "do")).toEqual(["the dog"]);
	expect(filter(arr, SEARCH.WORDS.ALL, "man")).toEqual(["the man"]);
	expect(filter(arr, SEARCH.WORDS.ALL, "ma")).toEqual(["the man"]);
	expect(filter(arr, SEARCH.WORDS.ALL, "man cat")).toEqual([]);
	expect(filter(arr, SEARCH.WORDS.ALL, "ma ca")).toEqual([]);

	// Returs same instance if no filtering needed.
	expect(filter(arr, SEARCH.WORDS.ALL, "the")).toBe(arr);
	expect(filter(arr, SEARCH.WORDS.ALL, "th")).toBe(arr);
});
test("filter(): Works correctly with SEARCH.WORDS.ANY", () => {
	const arr = ["the dog", "the man", "the cat"];
	expect(filter(arr, SEARCH.WORDS.ANY, "dog")).toEqual(["the dog"]);
	expect(filter(arr, SEARCH.WORDS.ANY, "do")).toEqual(["the dog"]);
	expect(filter(arr, SEARCH.WORDS.ANY, "man")).toEqual(["the man"]);
	expect(filter(arr, SEARCH.WORDS.ANY, "ma")).toEqual(["the man"]);
	expect(filter(arr, SEARCH.WORDS.ANY, "man cat")).toEqual(["the man", "the cat"]);
	expect(filter(arr, SEARCH.WORDS.ANY, "ma ca")).toEqual(["the man", "the cat"]);

	// Returs same instance if no filtering needed.
	expect(filter(arr, SEARCH.WORDS.ANY, "the")).toBe(arr);
	expect(filter(arr, SEARCH.WORDS.ANY, "th")).toBe(arr);
	expect(filter(arr, SEARCH.WORDS.ANY, "dog man cat")).toBe(arr);
	expect(filter(arr, SEARCH.WORDS.ANY, "do ma ca")).toBe(arr);
});
