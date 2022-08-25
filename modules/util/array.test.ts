import { getNextItem, getPrevItem, shuffleArray, uniqueArray, addItem, addItems, toggleItems, withItems, withoutItems, removeItem, removeItems } from "../index.js";

test("toggleItems()", () => {
	const arr = [1, 2, 3];
	expect(toggleItems(arr, 2)).toEqual([1, 3]);
	expect(toggleItems(arr, 2)).not.toBe(arr);
	expect(toggleItems(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(toggleItems(arr, 2)).not.toBe(arr);
	expect(toggleItems(arr, 2, 3)).toEqual([1]);
	expect(toggleItems(arr, 2, 3)).not.toBe(arr);
	expect(toggleItems(arr, 4, 5)).toEqual([1, 2, 3, 4, 5]);
	expect(toggleItems(arr, 4, 5)).not.toBe(arr);
	expect(toggleItems(arr, 1, 4)).toEqual([2, 3, 4]);
	expect(toggleItems(arr, 1, 4)).not.toBe(arr);
});
test("withItems()", () => {
	const arr = [1, 2, 3];
	expect(withItems(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(withItems(arr, 4)).not.toBe(arr);
	expect(withItems(arr, 2)).toBe(arr);
	expect(withItems(arr, 4, 5)).toEqual([1, 2, 3, 4, 5]);
	expect(withItems(arr, 4, 5)).not.toBe(arr);
	expect(withItems(arr, 1, 2)).toBe(arr);
});
test("withoutItems()", () => {
	const arr = [1, 2, 3];
	expect(withoutItems(arr, 2, 3)).toEqual([1]);
	expect(withoutItems(arr, 2, 3)).not.toBe(arr);
	expect(withoutItems(arr, 4, 5)).toBe(arr);
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
	expect(shuffleArray(arr)).toContain(1);
	expect(shuffleArray(arr)).toContain(2);
	expect(shuffleArray(arr)).toContain(3);
	expect(shuffleArray(arr)).not.toBe(arr);
});
test("uniqueItems()", () => {
	const arr = [1, 2, 3];
	expect(uniqueArray([1, 1, 1])).toEqual([1]);
});
