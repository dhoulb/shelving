import { getNextItem, getPrevItem, shuffleArray, uniqueArray, addArrayItem, addArrayItems, toggleArrayItems, withArrayItems, omitArrayItems, deleteArrayItems } from "../index.js";

test("toggleItems()", () => {
	const arr = [1, 2, 3];
	expect(toggleArrayItems(arr, 2)).toEqual([1, 3]);
	expect(toggleArrayItems(arr, 2)).not.toBe(arr);
	expect(toggleArrayItems(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(toggleArrayItems(arr, 2)).not.toBe(arr);
	expect(toggleArrayItems(arr, 2, 3)).toEqual([1]);
	expect(toggleArrayItems(arr, 2, 3)).not.toBe(arr);
	expect(toggleArrayItems(arr, 4, 5)).toEqual([1, 2, 3, 4, 5]);
	expect(toggleArrayItems(arr, 4, 5)).not.toBe(arr);
	expect(toggleArrayItems(arr, 1, 4)).toEqual([2, 3, 4]);
	expect(toggleArrayItems(arr, 1, 4)).not.toBe(arr);
});
test("withItems()", () => {
	const arr = [1, 2, 3];
	expect(withArrayItems(arr, 4)).toEqual([1, 2, 3, 4]);
	expect(withArrayItems(arr, 4)).not.toBe(arr);
	expect(withArrayItems(arr, 2)).toBe(arr);
	expect(withArrayItems(arr, 4, 5)).toEqual([1, 2, 3, 4, 5]);
	expect(withArrayItems(arr, 4, 5)).not.toBe(arr);
	expect(withArrayItems(arr, 1, 2)).toBe(arr);
});
test("omitArrayItems()", () => {
	const arr = [1, 2, 3];
	expect(omitArrayItems(arr, 2, 3)).toEqual([1]);
	expect(omitArrayItems(arr, 2, 3)).not.toBe(arr);
	expect(omitArrayItems(arr, 4, 5)).toBe(arr);
});
test("addArrayItem()", () => {
	const arr = [1, 2, 3];
	addArrayItem(arr, 4);
	expect(arr).toEqual([1, 2, 3, 4]);
});
test("addArrayItems()", () => {
	const arr = [1, 2, 3];
	addArrayItems(arr, 4, 5);
	expect(arr).toEqual([1, 2, 3, 4, 5]);
});
test("deleteArrayItems()", () => {
	const arr = [1, 2, 3];
	deleteArrayItems(arr, 2, 3);
	expect(arr).toEqual([1]);
});
test("getNextItem()", () => {
	const arr = [1, 2, 3];
	expect(getNextItem(arr, 1)).toBe(2);
	expect(getNextItem(arr, 2)).toBe(3);
	expect(getNextItem(arr, 3)).toBe(null);
	expect(getNextItem(arr, 4)).toBe(null);
});
test("getPrevItem()", () => {
	const arr = [1, 2, 3];
	expect(getPrevItem(arr, 1)).toBe(null);
	expect(getPrevItem(arr, 2)).toBe(1);
	expect(getPrevItem(arr, 3)).toBe(2);
	expect(getPrevItem(arr, 4)).toBe(null);
});
test("shuffleArray()", () => {
	const arr = [1, 2, 3];
	expect(shuffleArray(arr)).toContain(1);
	expect(shuffleArray(arr)).toContain(2);
	expect(shuffleArray(arr)).toContain(3);
	expect(shuffleArray(arr)).not.toBe(arr);
});
test("uniqueArray()", () => {
	expect(uniqueArray([1, 1, 1])).toEqual([1]);
});
