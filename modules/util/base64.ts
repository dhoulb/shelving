import type { AnyCaller } from "../error/BaseError.js";
import { ValueError } from "../error/ValueError.js";
import { type PossibleBytes, requireBytes } from "./bytes.js";

const BASE64_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64URL_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/** Create a reverse lookup table for decoding in { charCode: asciiValue } format. Works for both alphabets. */
const REVERSE_CHARS = new Uint8Array(128).fill(255);
for (let i = 0; i < BASE64_CHARS.length; i++) {
	REVERSE_CHARS[BASE64_CHARS.charCodeAt(i)] = i;
	REVERSE_CHARS[BASE64URL_CHARS.charCodeAt(i)] = i;
}

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

function _decode(base64: string, caller: AnyCaller): Uint8Array {
	// Remove padding.
	const cleaned = base64.replace(/=+$/, "");
	const length = cleaned.length;

	// Calculate output byte length
	// Every 4 base64 chars = 3 bytes; adjust for padding
	const byteLength = Math.floor((length * 6) / 8);
	const bytes = new Uint8Array(byteLength);

	let j = 0;
	for (let i = 0; i < length; i += 4) {
		const l1 = _lookup(cleaned, i, caller);
		const l2 = _lookup(cleaned, i + 1, caller);
		const l3 = i + 2 < length ? _lookup(cleaned, i + 2, caller) : 0;
		const l4 = i + 3 < length ? _lookup(cleaned, i + 3, caller) : 0;

		// Combine into 24 bits
		const combined = (l1 << 18) | (l2 << 12) | (l3 << 6) | l4;

		// Extract bytes and add to output if within range
		if (j < byteLength) bytes[j++] = (combined >> 16) & 0xff;
		if (j < byteLength) bytes[j++] = (combined >> 8) & 0xff;
		if (j < byteLength) bytes[j++] = combined & 0xff;
	}

	return bytes;
}

function _lookup(base64: string, index: number, caller: AnyCaller): number {
	const code = base64.charCodeAt(index);
	const value = REVERSE_CHARS[code];
	if (value === undefined || value === 255)
		throw new ValueError(`Invalid character "${code}" in Base64 string`, { received: base64, index: index, caller });
	return value;
}

/** Encode a string or binary data to Base64 string. */
export function encodeBase64(input: PossibleBytes, pad = true): string {
	return _encode(requireBytes(input), BASE64_CHARS, pad ? "=" : "");
}

/** Decode Base64 string to string (decodes Base64URL too). */
export function decodeBase64String(base64: string): string {
	return new TextDecoder("utf-8").decode(_decode(base64, decodeBase64String));
}

/** Decode URL-safe Base64 string to byte sequence (decodes Base64URL too). */
export function decodeBase64Bytes(base64: string): Uint8Array {
	return _decode(base64, decodeBase64Bytes);
}

/** Encode a string or binary data to URL-safe Base64 */
export function encodeBase64URL(input: PossibleBytes, pad = false): string {
	return _encode(requireBytes(input), BASE64URL_CHARS, pad ? "=" : "");
}

/** Decode a string from URL-safe Base64 (decodes Base64 too). */
export function decodeBase64URLString(base64: string): string {
	return new TextDecoder("utf-8").decode(_decode(base64, decodeBase64URLString));
}

/** Decode URL-safe Base64 string to byte sequence (decodes Base64 too). */
export function decodeBase64URLBytes(base64: string): Uint8Array {
	return _decode(base64, decodeBase64URLBytes);
}
