import { ValueError } from "../error/ValueError.js";
import type { AnyFunction } from "./function.js";

/** Encode a string to Base64 (with no `=` padding on the end). */
export function encodeBase64(str: string): string {
	return _encodeBase64(encodeBase64, str);
}
function _encodeBase64(caller: AnyFunction, str: string): string {
	try {
		return btoa(str).replace(/=+$/, "");
	} catch (thrown) {
		console.error(thrown);
		throw new ValueError("String contains invalid characters", {
			received: str,
			cause: thrown,
			caller,
		});
	}
}

/** Decode a string from Base64 (strips `=` padding on the end). */
export function decodeBase64(base64: string): string {
	return _decodeBase64(decodeBase64, base64);
}
function _decodeBase64(caller: AnyFunction, base64: string): string {
	try {
		return atob(base64.replace(/=+$/, ""));
	} catch (thrown) {
		throw new ValueError("Base64 string is not correctly encoded", {
			received: base64,
			cause: thrown,
			caller,
		});
	}
}

/** Encode a string to URL-safe Base64 */
export function encodeBase64Url(str: string): string {
	return _encodeBase64(encodeBase64Url, str).replace(/\+/g, "-").replace(/\//g, "_");
}

/** Decode a string from URL-safe Base64. */
export function decodeBase64Url(b64: string): string {
	return _decodeBase64(decodeBase64Url, b64.replace(/-/g, "+").replace(/_/g, "/"));
}
