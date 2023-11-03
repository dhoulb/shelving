import { ValueError } from "../error/ValueError.js";
import { isObject } from "./object.js";
import { isString } from "./string.js";

/**
 * Valid error codes in gRPC.
 * See also: https://firebase.google.com/docs/reference/node/firebase.firestore#firestoreerrorcode
 */
export type ErrorCode =
	| "cancelled"
	| "unknown"
	| "invalid-argument"
	| "deadline-exceeded"
	| "not-found"
	| "already-exists"
	| "permission-denied"
	| "resource-exhausted"
	| "failed-precondition"
	| "aborted"
	| "out-of-range"
	| "unimplemented"
	| "internal"
	| "unavailable"
	| "data-loss"
	| "unauthenticated";

/** Callback function that reports an error. */
export type Report = (reason: unknown) => void;

/** Log an error to the console. */
// eslint-disable-next-line no-console
export const logError: Report = reason => console.error(reason);

/** Is an unknown value an `Error` instance? */
export function isError(v: unknown): v is Error & { readonly code?: string | undefined } {
	return v instanceof Error;
}

/** Get the string `.code` property from an object or error, or `undefined` if it doesn't exist. */
export function getOptionalErrorCode(v: unknown): string | undefined {
	if (isObject(v) && isString(v.code)) return v.code;
}

/** Get the string `.code` property from an object or error, or throw `ValueError` if it doesn't exist. */
export function getErrorCode(v: unknown): string | undefined {
	const code = getOptionalErrorCode(v);
	if (typeof code !== "string") throw new ValueError("Error code must be string", v);
	return code;
}
