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
export function logError(reason: unknown): void {
	console.error(reason);
}

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
/** Pop a number of items off an error stack. */
export function popErrorStack(error: Error, count = 1): Error {
	const { name, message, stack } = error;
	if (stack) {
		const prefix = message ? `${name}: ${message}\n` : `${name}\n`;
		if (stack.startsWith(prefix)) {
			// In Chrome and Node the name and message of the error is the first line of the stack (so we need to skip over the first line).
			const lines = stack.slice(prefix.length).split("\n");
			lines.splice(0, count);
			error.stack = prefix + lines.join("\n");
		} else {
			// In Firefox and Safari the stack starts straight away.
			const lines = stack.split("\n");
			lines.splice(0, count);
			error.stack = lines.join("\n");
		}
	}
	return error;
}
