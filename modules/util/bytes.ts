import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/**
 * A set of bytes stored as a `Uint8Array` byte sequence backed by an `ArrayBuffer`.
 *
 * @see https://shelving.cc/util/bytes/Bytes
 */
export type Bytes = Uint8Array<ArrayBuffer>;

/**
 * Types that can be converted to a `Uint8Array` byte sequence.
 *
 * @see https://shelving.cc/util/bytes/PossibleBytes
 */
export type PossibleBytes = Bytes | ArrayBuffer | string;

/**
 * Is an unknown value a set of bytes?
 *
 * @param value The value to test.
 * @returns `true` if `value` is a `Uint8Array` backed by an `ArrayBuffer`, narrowing its type.
 * @see https://shelving.cc/util/bytes/isBytes
 */
export function isBytes(value: unknown): value is Bytes {
	return value instanceof Uint8Array && value.buffer instanceof ArrayBuffer;
}

/**
 * Assert that an unknown value is a `Uint8Array` byte sequence (optionally with a min/max length).
 *
 * @param value The value to assert.
 * @param min Minimum allowed length (defaults to `0`).
 * @param max Maximum allowed length (defaults to `Infinity`).
 * @param caller Function to attribute a thrown error to (defaults to `assertBytes` itself).
 * @throws {RequiredError} If `value` is not a byte sequence within the allowed length range.
 * @see https://shelving.cc/util/bytes/assertBytes
 */
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
 *
 * @param value The value to convert.
 * @returns The byte sequence, or `undefined` if `value` cannot be converted.
 * @see https://shelving.cc/util/bytes/getBytes
 */
export function getBytes(value: unknown): Uint8Array<ArrayBuffer> | undefined {
	if (isBytes(value)) return value;
	if (value instanceof ArrayBuffer) return new Uint8Array<ArrayBuffer>(value);
	if (typeof value === "string") return new TextEncoder().encode(value);
	return undefined;
}

/**
 * Convert a possible set of bytes to a `Uint8Array` byte sequence, or throw `RequiredError` if the value cannot be converted.
 *
 * @param value The possible bytes to convert.
 * @param min Minimum allowed length (defaults to `0`).
 * @param max Maximum allowed length (defaults to `Infinity`).
 * @param caller Function to attribute a thrown error to (defaults to `requireBytes` itself).
 * @returns The converted byte sequence.
 * @throws {RequiredError} If `value` cannot be converted or is outside the allowed length range.
 * @see https://shelving.cc/util/bytes/requireBytes
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
