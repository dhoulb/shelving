import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/** We store a sets of bytes as a `Uint8Array` byte sequence. */
export type Bytes = Uint8Array<ArrayBuffer>;

/** Types that can be converted to a `Uint8Array` byte sequence. */
export type PossibleBytes = Bytes | ArrayBuffer | string;

/** Is an unknown value a set of bytes? */
export function isBytes(value: unknown): value is Bytes {
	return value instanceof Uint8Array && value.buffer instanceof ArrayBuffer;
}

/** Assert that an unknown value is a `Uint8Array` byte sequence. */
export function assertBytes(
	value: unknown,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	caller: AnyCaller = assertBytes,
): asserts value is Bytes {
	if (!isBytes(value) || value.length < min || value.length > max)
		throw new RequiredError(
			`Value must be byte sequence${min > 0 || max < Number.POSITIVE_INFINITY ? ` with length between ${min} and ${max}` : ""}`,
			{ received: value, caller },
		);
}

/**
 * Convert an unknown value to a `Uint8Array<ArrayBuffer>` byte sequence, or `undefined` if the value cannot be converted.
 *
 * - `Uint8Array` values are returned as-is (if backed by an `ArrayBuffer`) or copied to a new `Uint8Array` (if not).
 * - `ArrayBuffer` instances are converted to `Uint8Array`
 * - Strings are encoded as UTF-8 characters in a `Uint8Array`
 * - Everything else returns `undefined`
 */
export function getBytes(value: unknown): Uint8Array<ArrayBuffer> | undefined {
	if (isBytes(value)) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array<ArrayBuffer>(value);
	if (typeof value === "string") return new TextEncoder().encode(value);
	return undefined;
}

/**
 * Convert a possible set of bytes to a `Uint8Array` byte sequence, or throw `RequiredError` if the value cannot be converted.
 */
export function requireBytes(
	value: PossibleBytes,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	caller: AnyCaller = requireBytes,
): Uint8Array<ArrayBuffer> {
	const bytes = getBytes(value);
	assertBytes(bytes, min, max, caller);
	return bytes;
}
