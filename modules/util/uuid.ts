import { RequiredError } from "../error/RequiredError.js";

const R_NOT_LOWERCHAR = /[^0-9a-f]/g;

/**
 * Return a random UUID (v4) as a 32-character lowercase hex string with dashes stripped.
 *
 * @returns A random 32-character lowercase hex UUID string.
 * @example randomUUID() // "1b4e28ba2fa14931918f4c9bf9f12b3a"
 * @see https://shelving.cc/util/uuid/randomUUID
 */
export function randomUUID(): string {
	return crypto.randomUUID().replace(R_NOT_LOWERCHAR, "");
}

/**
 * Convert/validate a string value as a UUID, or return `undefined` if it isn't valid.
 *
 * - Strips any non-hex characters (including existing dashes) and normalises to lowercase.
 * - Requires exactly 32 hex characters after cleaning, otherwise returns `undefined`.
 * - The returned string is re-grouped into the canonical `8-4-4-4-12` segment layout.
 *
 * @param value The value to convert/validate as a UUID.
 * @returns The normalised UUID string, or `undefined` if the value is not a valid UUID.
 * @example getUUID("1b4e28ba-2fa1-4931-918f-4c9bf9f12b3a") // "1b4e28ba2fa14931918f4c9bf9f12b3a"
 * @see https://shelving.cc/util/uuid/getUUID
 */
export function getUUID(value: string): string | undefined {
	if (typeof value !== "string" || !value) return;
	// Strip any non-hex characters (including existing dashes), then normalize to lowercase.
	const cleaned = value.toLowerCase().replace(R_NOT_LOWERCHAR, "");
	if (cleaned.length !== 32) return;
	return `${cleaned.slice(0, 8)}${cleaned.slice(8, 12)}${cleaned.slice(12, 16)}${cleaned.slice(16, 20)}${cleaned.slice(20)}`;
}

/**
 * Convert/validate a string value as a UUID, or throw `RequiredError` if it isn't valid.
 *
 * @param value The value to convert/validate as a UUID.
 * @returns The normalised UUID string.
 * @throws `RequiredError` if the value is not a valid UUID.
 * @example requireUUID("1b4e28ba-2fa1-4931-918f-4c9bf9f12b3a") // "1b4e28ba2fa14931918f4c9bf9f12b3a"
 * @see https://shelving.cc/util/uuid/requireUUID
 */
export function requireUUID(value: string): string {
	const uuid = getUUID(value);
	if (!uuid) throw new RequiredError("Invalid UUID");
	return uuid;
}
