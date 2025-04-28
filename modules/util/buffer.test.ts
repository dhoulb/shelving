import { expect, test } from "bun:test";
import { ValueError } from "../index.js";
import { decodeBufferView, encodeBufferView, isBuffer, isBufferView } from "../index.js";

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

test("isBufferView()", () => {
	// Valid ArrayBufferView
	expect(isBufferView(new Uint8Array(8))).toBe(true);
	expect(isBufferView(new Float32Array(8))).toBe(true);

	// Invalid cases
	expect(isBufferView(new ArrayBuffer(8))).toBe(false); // Not a view
	expect(isBufferView(null)).toBe(false);
	expect(isBufferView(undefined)).toBe(false);
	expect(isBufferView({})).toBe(false);
	expect(isBufferView([])).toBe(false);
});

test("encodeBufferView()", () => {
	// Valid encoding
	const str = "Hello, world!";
	const encoded = encodeBufferView(str);
	expect(encoded).toBeInstanceOf(Uint8Array);
	expect(new TextDecoder().decode(encoded)).toBe(str);

	// Edge case: empty string
	const emptyEncoded = encodeBufferView("");
	expect(emptyEncoded).toBeInstanceOf(Uint8Array);
	expect(emptyEncoded.length).toBe(0);
});

test("decodeBufferView()", () => {
	// Valid decoding
	const str = "Hello, world!";
	const encoded = new TextEncoder().encode(str);
	expect(decodeBufferView(encoded)).toBe(str);

	// Decoding ArrayBuffer
	const arrayBuffer = encoded.buffer;
	expect(decodeBufferView(arrayBuffer as ArrayBuffer)).toBe(str);

	// Edge case: empty buffer
	const emptyBuffer = new Uint8Array(0);
	expect(decodeBufferView(emptyBuffer)).toBe("");

	// Invalid decoding (corrupted buffer)
	const invalidBuffer = new Uint8Array([0xff, 0xff, 0xff]);
	expect(() => decodeBufferView(invalidBuffer)).toThrow(ValueError);
});
