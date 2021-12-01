import { derive, deriveArray, deriveData, deriveObject, NULL } from "../index.js";

test("derive()", () => {
	expect(derive(10, n => n * n)).toBe(100);
	expect(derive(10, { derive: n => n * n })).toEqual(100);
});
test("deriveArray()", () => {
	const arr = [1, 2, 3, 4];

	// Square each number.
	expect(deriveArray(arr, n => n * n)).toEqual([1, 4, 9, 16]);
	expect(deriveArray(arr, { derive: n => n * n })).toEqual([1, 4, 9, 16]);
	// Use a flat value instead of a mapper function.
	expect(deriveArray(arr, NULL)).toEqual([null, null, null, null]);
	expect(deriveArray(arr, NULL)).not.toBe(arr);
});
test("deriveObject()", () => {
	const obj = { a: 1, b: 2, c: 3, d: 4 };

	// Square each number (input is object).
	expect(deriveObject(obj, n => n * n)).toEqual({ a: 1, b: 4, c: 9, d: 16 });
	expect(deriveObject(obj, { derive: n => n * n })).toEqual({ a: 1, b: 4, c: 9, d: 16 });
});
test("deriveData()", () => {
	const obj = { a: 10, b: 20 };
	// Normal.
	expect(deriveData(obj, { a: 100 })).toEqual({ a: 100, b: 20 });
	expect(deriveData(obj, { a: 10 })).toEqual({ a: 10, b: 20 });
	expect(deriveData(obj, { a: 10 })).toBe(obj); // Returns same instance.
	// Function derives.
	expect(deriveData(obj, { b: n => n * n })).toEqual({ a: 10, b: 400 });
});
