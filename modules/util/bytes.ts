import { RequiredError } from "../error/RequiredError.js";

/** Types that can be converted to a `Uint8Array` byte sequence. */
export type PossibleBytes = Uint8Array | ArrayBuffer | string;

/**
 * Convert an unknown value to a `Uint8Array` byte sequence, or `undefined` if the value cannot be converted.
 *
 * - ArrayBuffers and TypedArrays are converted to `Uint8Array`
 * - Strings are encoded as UTF-8.
 * - Everything else returns `undefined`
 */
export function getBytes(value: unknown): Uint8Array | undefined {
	if (value instanceof Uint8Array) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array(value);
	if (typeof value === "string") return new TextEncoder().encode(value);
	return undefined;
}

/** Convert an unknown value to a `Uint8Array` byte sequence, or throw `RequiredError` if the value cannot be converted. */
export function requireBytes(value: PossibleBytes): Uint8Array {
	const bytes = getBytes(value);
	if (bytes === undefined) throw new RequiredError("Value cannot be converted to byte array", { received: value, caller: requireBytes });
	return bytes;
}
