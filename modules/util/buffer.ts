/**
 * Union of the numeric `TypedArray` views over an `ArrayBufferLike` (excludes `DataView`).
 *
 * @see https://shelving.cc/util/buffer/TypedArray
 */
export type TypedArray<T extends ArrayBufferLike = ArrayBufferLike> =
	| Uint8Array<T>
	| Uint16Array<T>
	| Uint32Array<T>
	| Int8Array<T>
	| Int16Array<T>
	| Int32Array<T>
	| Float32Array<T>
	| Float64Array<T>;

/**
 * Detect if an unknown value is an `ArrayBuffer` (not a view like `Uint8Array` or `Float32Array` or `DataView`).
 *
 * @param value The value to test.
 * @returns `true` if `value` is an `ArrayBuffer`, narrowing its type.
 * @see https://shelving.cc/util/buffer/isBuffer
 */
export function isBuffer(value: unknown): value is ArrayBuffer {
	return value instanceof ArrayBuffer;
}

/**
 * Detect if an unknown value is an `ArrayBufferView`, like `Uint8Array` or `Float32Array` or `DataView`.
 *
 * @param value The value to test.
 * @returns `true` if `value` is an `ArrayBufferView`, narrowing its type.
 * @see https://shelving.cc/util/buffer/isBufferView
 */
export function isBufferView(value: unknown): value is ArrayBufferView {
	return ArrayBuffer.isView(value);
}

/**
 * Detect if an unknown value is a `TypedArray`, like `Uint8Array` or `Float32Array` (not including `DataView`).
 *
 * @param value The value to test.
 * @returns `true` if `value` is a numeric `TypedArray`, narrowing its type.
 * @see https://shelving.cc/util/buffer/isTypedArray
 */
export function isTypedArray(value: unknown): value is TypedArray {
	return value instanceof Object.getPrototypeOf(Uint8Array);
}
