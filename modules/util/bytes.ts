import { RequiredError } from "../error/RequiredError.js";
import type { AnyCaller } from "./function.js";

/** Types that can be converted to a `Uint8Array` byte sequence. */
export type PossibleBytes = Uint8Array | ArrayBuffer | string;

/** Assert that an unknown value is a `Uint8Array` byte sequence. */
export function assertBytes(
	value: unknown,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	caller: AnyCaller = assertBytes,
): asserts value is Uint8Array {
	if (!(value instanceof Uint8Array) || value.length < min || value.length > max)
		throw new RequiredError(
			`Value must be byte sequence${min > 0 || max < Number.POSITIVE_INFINITY ? ` with length between ${min} and ${max}` : ""}`,
			{ received: value, caller },
		);
}

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
export function requireBytes(value: PossibleBytes, min = 0, max = Number.POSITIVE_INFINITY, caller: AnyCaller = requireBytes): Uint8Array {
	const bytes = getBytes(value);
	assertBytes(bytes, min, max, caller);
	return bytes;
}
