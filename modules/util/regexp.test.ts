import { expect, test } from "bun:test";
import {
	createRegExpAll,
	createRegExpAny,
	filterArray,
	getMatch,
	getMatchGroups,
	isMatch,
	notMatch,
	requireMatch,
	requireMatchGroups,
} from "../index.js";

test("getAllRegExp()", () => {
	// No pattern (always true).
	expect(createRegExpAll([]).test("")).toBe(true);
	expect(createRegExpAll([]).test("the dog and the cat")).toBe(true);

	// Array with one pattern.
	expect(createRegExpAll(["dog"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAll(["cat"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAll(["tapir"]).test("the dog and the cat")).toBe(false);

	// Array with multiple pattern.
	expect(createRegExpAll(["dog", "cat"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAll(["the", "the"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAll(["tapir", "cat"]).test("the dog and the cat")).toBe(false);
});
test("getAnyRegExp()", () => {
	// No pattern (always false).
	expect(createRegExpAny([]).test("")).toBe(false);
	expect(createRegExpAny([]).test("the dog and the cat")).toBe(false);

	// Array with one pattern.
	expect(createRegExpAny(["dog"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAny(["cat"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAny(["tapir"]).test("the dog and the cat")).toBe(false);

	// Array with multiple pattern.
	expect(createRegExpAny(["dog", "cat"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAny(["tapir", "cat"]).test("the dog and the cat")).toBe(true);
	expect(createRegExpAny(["tapir", "elephant"]).test("the dog and the cat")).toBe(false);
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
test("getOptionalMatch()", () => {
	expect(getMatch("abc1", /[a-z]{3}[0-9]/)).toMatchObject({ 0: "abc1" });
});
test("getMatch()", () => {
	expect(requireMatch("abc1", /[a-z]{3}[0-9]/)).toMatchObject({ 0: "abc1" });
});
test("getOptionalMatchGroups()", () => {
	expect(getMatchGroups("abc123", /(?<str>[a-z]+)(?<num>[0-9]+)/)).toMatchObject({ str: "abc", num: "123" });
});
test("getMatchGroups()", () => {
	expect(requireMatchGroups("abc123", /(?<str>[a-z]+)(?<num>[0-9]+)/)).toMatchObject({ str: "abc", num: "123" });
});
