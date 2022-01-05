import { countItems, countIterations, yieldChunks, getArray, yieldRange, limitItems, yieldUntilLimit, Signal, yieldDelay, yieldUntilSignal, yieldCall } from "../index.js";

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
test("limitItems", () => {
	expect(getArray(limitItems([1, 2], 3))).toEqual([1, 2]);
	expect(getArray(limitItems([1, 2, 3, 4, 5], 3))).toEqual([1, 2, 3]);
	expect(getArray(limitItems(new Set([1, 2]), 3))).toEqual([1, 2]);
	expect(getArray(limitItems(new Set([1, 2, 3, 4, 5]), 3))).toEqual([1, 2, 3]);
	expect(getArray(limitItems(yieldRange(9, 10), 5))).toEqual([9, 10]);
	expect(getArray(limitItems(yieldRange(15, 200), 5))).toEqual([15, 16, 17, 18, 19]);
});
test("yieldUntilLimit", () => {
	expect(getArray(yieldUntilLimit([1, 2, 3, 4, 5], 3))).toEqual([1, 2, 3]);
	expect(getArray(yieldUntilLimit(new Set([1, 2, 3, 4, 5]), 3))).toEqual([1, 2, 3]);
	expect(getArray(yieldUntilLimit(yieldRange(15, 200), 5))).toEqual([15, 16, 17, 18, 19]);
});
test("yieldCall", () => {
	const getStr = () => "abc";
	expect(getArray(yieldUntilLimit(yieldCall(getStr), 3))).toEqual(["abc", "abc", "abc"]);
});
test("chunkItems()", () => {
	expect(getArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 1))).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]]);
	expect(getArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 2))).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
	expect(getArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 3))).toEqual([
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
	]);
	expect(getArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 4))).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
	expect(getArray(yieldChunks([1, 2, 3, 4, 5, 6, 7, 8, 9], 5))).toEqual([
		[1, 2, 3, 4, 5],
		[6, 7, 8, 9],
	]);
	expect(getArray(yieldChunks(yieldRange(11, 19), 1))).toEqual([[11], [12], [13], [14], [15], [16], [17], [18], [19]]);
	expect(getArray(yieldChunks(yieldRange(11, 19), 2))).toEqual([[11, 12], [13, 14], [15, 16], [17, 18], [19]]);
});
test("yieldUntilSignal()", async () => {
	const yielded: number[] = [];
	const stop = new Signal();
	for await (const count of yieldUntilSignal(yieldDelay(50), stop)) {
		yielded.push(count);
		if (count >= 3) stop.done();
	}
	expect(yielded).toEqual([1, 2, 3]);
});
