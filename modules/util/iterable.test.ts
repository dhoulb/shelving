import { countItems, countIterations, sumItems, yieldChunks, toArray, yieldRange, limitItems, limitIterations } from "../index.js";

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
	expect(countItems(yieldRange(19, 19))).toBe(1);
	expect(countItems(yieldRange(21, 28))).toBe(8);
});
test("countIterations()", () => {
	expect(countIterations([])).toBe(0);
	expect(countIterations([1, 2, 3, 4, 5, 6])).toBe(6);
	expect(countIterations(yieldRange(19, 19))).toBe(1);
	expect(countIterations(yieldRange(21, 28))).toBe(8);
});
test("sumItems()", () => {
	expect(sumItems([])).toBe(0);
	expect(sumItems([1, 2, 3, 4, 5, 6])).toBe(21);
	expect(sumItems(new Set([1, 2, 3, 4, 5]))).toBe(15);
	expect(sumItems(yieldRange(0, 0))).toBe(0);
	expect(sumItems(yieldRange(1, 1))).toBe(1);
	expect(sumItems(yieldRange(31, 29))).toBe(90);
});
test("limitItems", () => {
	expect(toArray(limitItems([1, 2], 3))).toEqual([1, 2]);
	expect(toArray(limitItems([1, 2, 3, 4, 5], 3))).toEqual([1, 2, 3]);
	expect(toArray(limitItems(new Set([1, 2]), 3))).toEqual([1, 2]);
	expect(toArray(limitItems(new Set([1, 2, 3, 4, 5]), 3))).toEqual([1, 2, 3]);
	expect(toArray(limitItems(yieldRange(9, 10), 5))).toEqual([9, 10]);
	expect(toArray(limitItems(yieldRange(15, 200), 5))).toEqual([15, 16, 17, 18, 19]);
});
test("limitIterations", () => {
	expect(toArray(limitIterations([1, 2, 3, 4, 5], 3))).toEqual([1, 2, 3]);
	expect(toArray(limitIterations(new Set([1, 2, 3, 4, 5]), 3))).toEqual([1, 2, 3]);
	expect(toArray(limitIterations(yieldRange(15, 200), 5))).toEqual([15, 16, 17, 18, 19]);
});
test("chunkItems()", () => {
	expect(toArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 1))).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]]);
	expect(toArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 2))).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
	expect(toArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 3))).toEqual([
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
	]);
	expect(toArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 4))).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
	expect(toArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 5))).toEqual([
		[1, 2, 3, 4, 5],
		[6, 7, 8, 9],
	]);
	expect(toArray(yieldChunks(yieldRange(11, 19), 1))).toEqual([[11], [12], [13], [14], [15], [16], [17], [18], [19]]);
	expect(toArray(yieldChunks(yieldRange(11, 19), 2))).toEqual([[11, 12], [13, 14], [15, 16], [17, 18], [19]]);
});
