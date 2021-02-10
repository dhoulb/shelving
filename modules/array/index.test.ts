import { SKIP, arrayChunk, toggleItem, withItem, withoutItem, replaceItem, getNextItem, getPrevItem, shuffle, isArray, mapArray } from "..";
import { uniqueItems } from ".";

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
	expect(arrayChunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 1)).toEqual([[1], [2], [3], [4], [5], [6], [7], [8], [9]]);
	expect(arrayChunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 2)).toEqual([[1, 2], [3, 4], [5, 6], [7, 8], [9]]);
	expect(arrayChunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 3)).toEqual([
		[1, 2, 3],
		[4, 5, 6],
		[7, 8, 9],
	]);
	expect(arrayChunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 4)).toEqual([[1, 2, 3, 4], [5, 6, 7, 8], [9]]);
	expect(arrayChunk([1, 2, 3, 4, 5, 6, 7, 8, 9], 5)).toEqual([
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
test("withItem()", () => {
	const arr = [1, 2, 3];
	expect(withItem(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(withItem(arr, 4)).not.toBe(arr);
	expect(withItem(arr, 2)).toBe(arr);
});
test("withoutItem()", () => {
	const arr = [1, 2, 3];
	expect(withoutItem(arr, 2)).toEqual([1, 3]);
	expect(withoutItem(arr, 2)).not.toBe(arr);
	expect(withoutItem(arr, 4)).toBe(arr);
});
test("replaceItem()", () => {
	const arr = [1, 2, 3];
	expect(replaceItem(arr, 2, 222)).toEqual([1, 222, 3]);
	expect(replaceItem(arr, 2, 222)).not.toBe(arr);
	expect(replaceItem(arr, 4, 444)).toBe(arr);
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
	expect(mapArray(arr, n => n * n)).toEqual([1, 4, 9, 16]);
	expect(mapArray(arr, n => n * n)).not.toBe(arr);
	// Works with promises.
	expect(mapArray(arr, n => Promise.resolve(n * n))).toBeInstanceOf(Promise);
	expect(await mapArray(arr, n => Promise.resolve(n * n))).toEqual([1, 4, 9, 16]);
	// Use SKIP to skip odd numbers.
	expect(mapArray(arr, n => (n % 2 ? n : SKIP))).toEqual([1, 3]);
	expect(mapArray(arr, n => (n % 2 ? n : SKIP))).not.toBe(arr);
	// Use a flat value instead of a mapper function.
	expect(mapArray(arr, null)).toEqual([null, null, null, null]);
	expect(mapArray(arr, null)).not.toBe(arr);
	// Return same instance if no numbers changed.
	expect(mapArray(arr, n => n)).toBe(arr);
	// Works on objects too.
	expect(mapArray(obj, n => n * n)).toEqual([1, 4, 9, 16]);
	expect(mapArray(obj, n => n * n)).not.toBe(obj);
	expect(mapArray(obj, n => n)).toEqual(arr);
	expect(mapArray(obj, n => n)).not.toBe(obj);
});
test("uniqueItems()", () => {
	const arr = [1, 2, 3];
	expect(uniqueItems(arr)).toBe(arr);
	expect(uniqueItems([1, 1, 1])).toEqual([1]);
});
