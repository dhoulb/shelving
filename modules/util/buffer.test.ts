import { expect, test } from "bun:test";
import { isBuffer, isBufferView, isTypedArray } from "../index.js";

test("isBuffer()", () => {
	// Valid ArrayBuffer
	expect(isBuffer(new ArrayBuffer(8))).toBe(true);

	// Invalid cases
	expect(isBuffer(null)).toBe(false);
	expect(isBuffer(undefined)).toBe(false);
	expect(isBuffer({})).toBe(false);
	expect(isBuffer([])).toBe(false);
	expect(isBuffer(new Uint8Array(8))).toBe(false); // ArrayBufferView
});
test("isTypedArray()", () => {
	// Valid ArrayBufferView
	expect(isTypedArray(new Uint8Array(8))).toBe(true);
	expect(isTypedArray(new Float32Array(8))).toBe(true);

	// Invalid cases
	expect(isTypedArray(new ArrayBuffer(8))).toBe(false); // Not a view
	expect(isTypedArray(null)).toBe(false);
	expect(isTypedArray(undefined)).toBe(false);
	expect(isTypedArray({})).toBe(false);
	expect(isTypedArray([])).toBe(false);
	expect(isTypedArray(new DataView(new ArrayBuffer()))).toBe(false);
});
test("isBufferView()", () => {
	// Valid ArrayBufferView
	expect(isBufferView(new Uint8Array(8))).toBe(true);
	expect(isBufferView(new Float32Array(8))).toBe(true);
	expect(isBufferView(new DataView(new ArrayBuffer()))).toBe(true);

	// Invalid cases
	expect(isBufferView(new ArrayBuffer(8))).toBe(false); // Not a view
	expect(isBufferView(null)).toBe(false);
	expect(isBufferView(undefined)).toBe(false);
	expect(isBufferView({})).toBe(false);
	expect(isBufferView([])).toBe(false);
});
