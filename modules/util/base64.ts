import { type PossibleBytes, requireBytes } from "./bytes.js";

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * @todo DH: When it's well supported, use `Uint8Array.toBase64()`: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64
 */
function _encode(bytes: Uint8Array, alphabet: string, pad: string): string {
	const len = bytes.length;
	let output = "";

	for (let i = 0; i < len; i += 3) {
		const b1 = bytes[i] as number;
		const b2 = i + 1 < len ? (bytes[i + 1] as number) : 0;
		const b3 = i + 2 < len ? (bytes[i + 2] as number) : 0;

		const combined = (b1 << 16) | (b2 << 8) | b3;

		const c1 = (combined >> 18) & 0x3f;
		const c2 = (combined >> 12) & 0x3f;
		const c3 = (combined >> 6) & 0x3f;
		const c4 = combined & 0x3f;

		output += `${alphabet[c1]}${alphabet[c2]}${i + 1 < len ? alphabet[c3] : pad}${i + 2 < len ? alphabet[c4] : pad}`;
	}

	return output;
}

function _decode(base64: string, alphabet: string): Uint8Array {
	// Create a reverse lookup table: char -> 6-bit value
	const values = new Uint8Array(128);
	for (let i = 0; i < alphabet.length; i++) values[alphabet.charCodeAt(i)] = i;

	// Remove padding.
	const cleaned = base64.replace(/=+$/, "");
	const length = cleaned.length;

	// Calculate output byte length
	// Every 4 base64 chars = 3 bytes; adjust for padding
	const outputLength = Math.floor((length * 6) / 8);
	const output = new Uint8Array(outputLength);

	let j = 0;
	for (let i = 0; i < length; i += 4) {
		// Get 4 characters (or less at the end)
		const c1 = values[cleaned.charCodeAt(i)] as number;
		const c2 = values[cleaned.charCodeAt(i + 1)] as number;
		const c3 = i + 2 < length ? (values[cleaned.charCodeAt(i + 2)] as number) : 0;
		const c4 = i + 3 < length ? (values[cleaned.charCodeAt(i + 3)] as number) : 0;

		// Combine into 24 bits
		const combined = (c1 << 18) | (c2 << 12) | (c3 << 6) | c4;

		// Extract bytes and add to output if within range
		if (j < outputLength) output[j++] = (combined >> 16) & 0xff;
		if (j < outputLength) output[j++] = (combined >> 8) & 0xff;
		if (j < outputLength) output[j++] = combined & 0xff;
	}

	return output;
}

/** Encode a string or binary data to Base64 string. */
export function encodeBase64(input: PossibleBytes, pad = true): string {
	return _encode(requireBytes(input), BASE64_CHARS, pad ? "=" : "");
}

/** Decode Base64 string to string. */
export function decodeBase64String(base64: string): string {
	return new TextDecoder("utf-8").decode(_decode(base64, BASE64_CHARS));
}

/** Decode URL-safe Base64 string to binary data (as a UInt8Array). */
export function decodeBase64Bytes(base64: string): Uint8Array {
	return _decode(base64, BASE64_CHARS);
}

/** Encode a string or binary data to URL-safe Base64 */
export function encodeBase64URL(input: PossibleBytes, pad = false): string {
	return _encode(requireBytes(input), BASE64URL_CHARS, pad ? "=" : "");
}

/** Decode a string from URL-safe Base64. */
export function decodeBase64URLString(base64: string): string {
	return new TextDecoder("utf-8").decode(_decode(base64, BASE64URL_CHARS));
}

/** Decode URL-safe Base64 string to binary data (as a UInt8Array). */
export function decodeBase64URLBytes(base64: string): Uint8Array {
	return _decode(base64, BASE64URL_CHARS);
}
