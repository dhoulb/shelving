import { countItems, getChunks, getArray, getRange, limitItems } from "../index.js";

test("getRange()", () => {
	expect(getArray(getRange(1, 4))).toBe([1, 2, 3, 4]);
	expect(getArray(getRange(4, 1))).toBe([4, 3, 2, 1]);
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
test("limitItems", () => {
	expect(getArray(limitItems([1, 2], 3))).toEqual([1, 2]);
	expect(getArray(limitItems([1, 2, 3, 4, 5], 3))).toEqual([1, 2, 3]);
	expect(getArray(limitItems(new Set([1, 2]), 3))).toEqual([1, 2]);
	expect(getArray(limitItems(new Set([1, 2, 3, 4, 5]), 3))).toEqual([1, 2, 3]);
	expect(getArray(limitItems(getRange(9, 10), 5))).toEqual([9, 10]);
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
