import { RequiredError } from "../error/RequiredError.js";
import { isBuffer, isTypedArray } from "./buffer.js";

/**
 * Convert an unknown value to a `Uint8Array` array of bytes, or `undefined` if the value cannot be converted.
 *
 * - ArrayBuffers and TypedArrays are converted to `Uint8Array`
 * - Strings are encoded as UTF-8.
 * - Numbers are returned as 8-byte floats.
 * - Booleans are returned as 1-byte integers (0 or 1).
 * - `null` and `undefined` are returned as empty byte arrays.
 */
export function getBytes(value: unknown): Uint8Array | undefined {
	if (value instanceof Uint8Array) return value;
	if (isBuffer(value)) return new Uint8Array(value);
	if (isTypedArray(value)) return new Uint8Array(value.buffer);
	if (typeof value === "string") return new TextEncoder().encode(value);
	if (typeof value === "number") return new Uint8Array(new Float64Array([value]).buffer);
	if (value === true) return new Uint8Array([1]);
	if (value === false) return new Uint8Array([0]);
	if (value === null || value === undefined) return new Uint8Array([]);
	return undefined;
}

/** Convert an unknown value to a `Uint8Array` array of bytes, or throw `RequiredError` if the value cannot be converted. */
export function requireBytes(value: unknown): Uint8Array {
	const bytes = getBytes(value);
	if (bytes === undefined) throw new RequiredError("Value cannot be converted to byte array", { received: value, caller: requireBytes });
	return bytes;
}
