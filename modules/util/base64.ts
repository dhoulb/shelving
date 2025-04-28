/** Encode a string to Base64 (with no `=` padding on the end). */
export function encodeBase64(str: string): string {
	return btoa(str).replace(/=+$/, "");
}

/** Decode a string from Base64 (strips `=` padding on the end). */
export function decodeBase64(b64: string): string {
	return atob(b64.replace(/=+$/, ""));
}

/** Encode a string to URL-safe Base64 */
export function encodeBase64Url(str: string): string {
	return encodeBase64(str).replace(/\+/g, "-").replace(/\//g, "_");
}

/** Decode a string from URL-safe Base64. */
export function decodeBase64Url(b64: string): string {
	return decodeBase64(b64.replace(/-/g, "+").replace(/_/g, "/"));
}
