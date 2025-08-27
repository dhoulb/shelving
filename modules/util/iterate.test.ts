import { expect, test } from "bun:test";
import { countItems, getArray, getChunks, getRange, interleaveItems, limitItems, mergeItems, reduceItems } from "../index.js";

test("getRange()", () => {
	expect(getArray(getRange(1, 4))).toEqual([1, 2, 3, 4]);
	expect(getArray(getRange(4, 1))).toEqual([4, 3, 2, 1]);
});
test("countItems()", () => {
	expect(countItems([])).toBe(0);
	expect(countItems([1, 2, 3, 4, 5, 6])).toBe(6);
	expect(
		countItems(
			new Map([
				[1, 1],
				[2, 2],
				[3, 3],
			]),
		),
	).toBe(3);
	expect(countItems(new Set([1, 2, 3, 4, 5]))).toBe(5);
	expect(countItems(getRange(19, 19))).toBe(1);
	expect(countItems(getRange(21, 28))).toBe(8);
});
test("limitItems()", () => {
	expect(getArray(limitItems([1, 2, 3, 4, 5], 3))).toEqual([1, 2, 3]);
	expect(getArray(limitItems(new Set([1, 2, 3, 4, 5]), 3))).toEqual([1, 2, 3]);
	expect(getArray(limitItems(getRange(15, 200), 5))).toEqual([15, 16, 17, 18, 19]);
});
test("getChunks()", () => {
	expect(getArray(getChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 1))).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]]);
	expect(getArray(getChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 2))).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
	expect(getArray(getChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 3))).toEqual([
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
	]);
	expect(getArray(getChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 4))).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
	expect(getArray(getChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 5))).toEqual([
		[1, 2, 3, 4, 5],
		[6, 7, 8, 9],
	]);
	expect(getArray(getChunks(getRange(11, 19), 1))).toEqual([[11], [12], [13], [14], [15], [16], [17], [18], [19]]);
	expect(getArray(getChunks(getRange(11, 19), 2))).toEqual([[11, 12], [13, 14], [15, 16], [17, 18], [19]]);
});
test("reduceItems()", () => {
	expect(reduceItems([1, 2, 3], (p, v) => (typeof p === "number" ? p + v : v))).toBe(6);
	expect(reduceItems([1, 2, 3], (p, v) => p + v, 100)).toBe(106);
});
test("mergeItems()", () => {
	expect(getArray(mergeItems([1, 2, 3], [4, 5, 6]))).toEqual([1, 2, 3, 4, 5, 6]);
});
test("interleaveItems()", () => {
	expect(getArray(interleaveItems([1, 2, 3], 0))).toEqual([1, 0, 2, 0, 3]);
	expect(getArray(interleaveItems([1], 0))).toEqual([1]);
	expect(getArray(interleaveItems([], 0))).toEqual([]);
	expect(getArray(interleaveItems(["a", "b", "c"], "-"))).toEqual(["a", "-", "b", "-", "c"]);
	expect(getArray(interleaveItems(["a"], "-"))).toEqual(["a"]);
	expect(getArray(interleaveItems([], "-"))).toEqual([]);
	const result = getArray(interleaveItems([1, 2, 3], "x"));
	expect(result).toEqual([1, "x", 2, "x", 3]);
	const set = new Set([10, 20, 30]);
	expect(getArray(interleaveItems(set, 0))).toEqual([10, 0, 20, 0, 30]);
	const map = new Map([
		["a", 1],
		["b", 2],
		["c", 3],
	]);
	expect(getArray(interleaveItems(map.keys(), "|"))).toEqual(["a", "|", "b", "|", "c"]);
});
