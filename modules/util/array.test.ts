import {
	SKIP,
	chunkItems,
	toggleItem,
	withItem,
	withoutItem,
	swapItem,
	getNextItem,
	getPrevItem,
	shuffle,
	isArray,
	mapItems,
	uniqueItems,
	addItem,
	addItems,
	toggleItems,
	withItems,
	withoutItems,
	removeItem,
	removeItems,
} from "../index.js";

test("isArray()", () => {
	expect(isArray([])).toBe(true);
	expect(isArray({})).toBe(false);
	expect(isArray(Symbol())).toBe(false);
	expect(isArray(null)).toBe(false);
	expect(isArray("abc")).toBe(false);
	expect(isArray(true)).toBe(false);
	expect(isArray(false)).toBe(false);
});
test("arrayChunk()", () => {
	expect(chunkItems([1, 2, 3, 4, 5, 6, 7, 8, 9], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]]);
	expect(chunkItems([1, 2, 3, 4, 5, 6, 7, 8, 9], 2)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
	expect(chunkItems([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toEqual([
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
	]);
	expect(chunkItems([1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
	expect(chunkItems([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)).toEqual([
		[1, 2, 3, 4, 5],
		[6, 7, 8, 9],
	]);
});
test("toggleItem()", () => {
	const arr = [1, 2, 3];
	expect(toggleItem(arr, 2)).toEqual([1, 3]);
	expect(toggleItem(arr, 2)).not.toBe(arr);
	expect(toggleItem(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(toggleItem(arr, 2)).not.toBe(arr);
});
test("toggleItems()", () => {
	const arr = [1, 2, 3];
	expect(toggleItems(arr, [2, 3])).toEqual([1]);
	expect(toggleItems(arr, [2, 3])).not.toBe(arr);
	expect(toggleItems(arr, [4, 5])).toEqual([1, 2, 3, 4, 5]);
	expect(toggleItems(arr, [4, 5])).not.toBe(arr);
	expect(toggleItems(arr, [1, 4])).toEqual([2, 3, 4]);
	expect(toggleItems(arr, [1, 4])).not.toBe(arr);
});
test("withItem()", () => {
	const arr = [1, 2, 3];
	expect(withItem(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(withItem(arr, 4)).not.toBe(arr);
	expect(withItem(arr, 2)).toBe(arr);
});
test("withItems()", () => {
	const arr = [1, 2, 3];
	expect(withItems(arr, [4, 5])).toEqual([1, 2, 3, 4, 5]);
	expect(withItems(arr, [4, 5])).not.toBe(arr);
	expect(withItems(arr, [1, 2])).toBe(arr);
});
test("withoutItem()", () => {
	const arr = [1, 2, 3];
	expect(withoutItem(arr, 2)).toEqual([1, 3]);
	expect(withoutItem(arr, 2)).not.toBe(arr);
	expect(withoutItem(arr, 4)).toBe(arr);
});
test("withoutItems()", () => {
	const arr = [1, 2, 3];
	expect(withoutItems(arr, [2, 3])).toEqual([1]);
	expect(withoutItems(arr, [2, 3])).not.toBe(arr);
	expect(withoutItems(arr, [4, 5])).toBe(arr);
});
test("replaceItem()", () => {
	const arr = [1, 2, 3];
	expect(swapItem(arr, 2, 222)).toEqual([1, 222, 3]);
	expect(swapItem(arr, 2, 222)).not.toBe(arr);
	expect(swapItem(arr, 4, 444)).toBe(arr);
});
test("addItem()", () => {
	const arr = [1, 2, 3];
	addItem(arr, 4);
	expect(arr).toEqual([1, 2, 3, 4]);
});
test("addItems()", () => {
	const arr = [1, 2, 3];
	addItems(arr, [4, 5]);
	expect(arr).toEqual([1, 2, 3, 4, 5]);
});
test("removeItem()", () => {
	const arr = [1, 2, 3];
	removeItem(arr, 3);
	expect(arr).toEqual([1, 2]);
});
test("removeItems()", () => {
	const arr = [1, 2, 3];
	removeItems(arr, [2, 3]);
	expect(arr).toEqual([1]);
});
test("getNextItem()", () => {
	const arr = [1, 2, 3];
	expect(getNextItem(arr, 1)).toBe(2);
	expect(getNextItem(arr, 2)).toBe(3);
	expect(getNextItem(arr, 3)).toBe(undefined);
	expect(getNextItem(arr, 4)).toBe(undefined);
});
test("getPrevItem()", () => {
	const arr = [1, 2, 3];
	expect(getPrevItem(arr, 1)).toBe(undefined);
	expect(getPrevItem(arr, 2)).toBe(1);
	expect(getPrevItem(arr, 3)).toBe(2);
	expect(getPrevItem(arr, 4)).toBe(undefined);
});
test("shuffle()", () => {
	const arr = [1, 2, 3];
	expect(shuffle(arr)).toContain(1);
	expect(shuffle(arr)).toContain(2);
	expect(shuffle(arr)).toContain(3);
	expect(shuffle(arr)).not.toBe(arr);
});
test("mapArray()", async () => {
	const arr = [1, 2, 3, 4];
	const obj = { a: 1, b: 2, c: 3, d: 4 };

	// Square each number.
	expect(mapItems(arr, n => n * n)).toEqual([1, 4, 9, 16]);
	expect(mapItems(arr, n => n * n)).not.toBe(arr);
	// Works with promises.
	expect(mapItems(arr, n => Promise.resolve(n * n))).toBeInstanceOf(Promise);
	expect(await mapItems(arr, n => Promise.resolve(n * n))).toEqual([1, 4, 9, 16]);
	// Use SKIP to skip odd numbers.
	expect(mapItems(arr, n => (n % 2 ? n : SKIP))).toEqual([1, 3]);
	expect(mapItems(arr, n => (n % 2 ? n : SKIP))).not.toBe(arr);
	// Use a flat value instead of a mapper function.
	expect(mapItems(arr, null)).toEqual([null, null, null, null]);
	expect(mapItems(arr, null)).not.toBe(arr);
	// Return same instance if no numbers changed.
	expect(mapItems(arr, n => n)).toBe(arr);
	// Works on objects too.
	expect(mapItems(obj, n => n * n)).toEqual([1, 4, 9, 16]);
	expect(mapItems(obj, n => n * n)).not.toBe(obj);
	expect(mapItems(obj, n => n)).toEqual(arr);
	expect(mapItems(obj, n => n)).not.toBe(obj);
});
test("uniqueItems()", () => {
	const arr = [1, 2, 3];
	expect(uniqueItems(arr)).toBe(arr);
	expect(uniqueItems([1, 1, 1])).toEqual([1]);
});
