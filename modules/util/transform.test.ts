import { expect, test } from "@jest/globals";
import { getUndefined, mapArray, mapObject, transformObject } from "../index.js";

test("mapArray()", () => {
	const arr = [1, 2, 3, 4];

	// Square each number.
	expect(mapArray(arr, n => n * n)).toEqual([1, 4, 9, 16]);
});
test("mapObject()", () => {
	const obj = { a: 1, b: 2, c: 3, d: 4 };

	// Square each number (input is object).
	expect(mapObject(obj, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
});
test("transformObject()", () => {
	const obj = { a: 10, b: 20 };
	// Function transforms.
	expect(transformObject(obj, { b: n => n * n })).toEqual({ a: 10, b: 400 });
	// `undefined` deletes the element.
	expect(transformObject(obj, { a: getUndefined })).toEqual({ b: 20 });
});
