import { transform, transformArray, transformData, transformObject, GET_NULL } from "../index.js";

test("transform()", () => {
	expect(transform(10, n => n * n)).toBe(100);
	expect(transform(10, { transform: n => n * n })).toEqual(100);
});
test("transformArray()", () => {
	const arr = [1, 2, 3, 4];

	// Square each number.
	expect(transformArray(arr, n => n * n)).toEqual([1, 4, 9, 16]);
	expect(transformArray(arr, { transform: n => n * n })).toEqual([1, 4, 9, 16]);
	// Use a flat value instead of a mapper function.
	expect(transformArray(arr, GET_NULL)).toEqual([null, null, null, null]);
	expect(transformArray(arr, GET_NULL)).not.toBe(arr);
});
test("transformObject()", () => {
	const obj = { a: 1, b: 2, c: 3, d: 4 };

	// Square each number (input is object).
	expect(transformObject(obj, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	expect(transformObject(obj, { transform: n => n * n })).toEqual({ a: 1, b: 4, c: 9, d: 16 });
});
test("transformData()", () => {
	const obj = { a: 10, b: 20 };
	// Normal.
	expect(transformData(obj, { a: 100 })).toEqual({ a: 100, b: 20 });
	expect(transformData(obj, { a: 10 })).toEqual({ a: 10, b: 20 });
	// expect(transformData(obj, { a: 10 })).toBe(obj); // Returns same instance.
	// Function transforms.
	expect(transformData(obj, { b: n => n * n })).toEqual({ a: 10, b: 400 });
});
