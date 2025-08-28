import { RequiredError } from "../error/RequiredError.js";

/** Return a random UUID (v4) */
export function randomUUID(): string {
	return crypto.randomUUID();
}

const R_NOT_LOWERCHAR = /[^0-9a-f]/g;

/** Convert/validate a unknown value as as UUID. */
export function getUUID(value: string): string | undefined {
	if (typeof value !== "string" || !value) return;
	// Strip any non-hex characters (including existing dashes), then normalize to lowercase.
	const cleaned = value.toLowerCase().replace(R_NOT_LOWERCHAR, "");
	if (cleaned.length !== 32) return;
	return `${cleaned.slice(0, 8)}${cleaned.slice(8, 12)}${cleaned.slice(12, 16)}${cleaned.slice(16, 20)}${cleaned.slice(20)}`;
}

/** Require a valid UUID. */
export function requireUUID(value: string): string {
	const uuid = getUUID(value);
	if (!uuid) throw new RequiredError("Invalid UUID");
	return uuid;
}
