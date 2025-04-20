/** Encode a string to Base64 (with no `=` padding on the end). */
export function base64Encode(str: string): string {
	return btoa(str).replace(/=+$/, "");
}

/** Decode a string from Base64 (strips `=` padding on the end). */
export function base64Decode(b64: string): string {
	return atob(b64.replace(/=+$/, ""));
}

/** Encode a string to URL-safe Base64 */
export function base64UrlEncode(str: string): string {
	return base64Encode(str).replace(/\+/g, "-").replace(/\//g, "_");
}

/** Decode a string from URL-safe Base64. */
export function base64UrlDecode(b64: string): string {
	return base64Decode(b64.replace(/-/g, "+").replace(/_/g, "/"));
}
