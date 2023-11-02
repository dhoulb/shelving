import { AssertionError } from "../error/AssertionError.js";
import { isObject } from "./object.js";
import { isString } from "./string.js";

/** Callback function that reports an error. */
export type Report = (reason: unknown) => void;

/** Log an error to the console. */
// eslint-disable-next-line no-console
export const logError: Report = reason => console.error(reason);

/** Is an unknown value an `Error` instance? */
export function isError(v: unknown): v is Error & { readonly code?: string | undefined } {
	return v instanceof Error;
}

/** An `Error` with a `.code` string. */
export interface CodedError extends Error {
	readonly code: string;
}

/** Get the string `.code` property from an object or error, or `undefined` if it doesn't exist. */
export function getOptionalErrorCode(v: unknown): string | undefined {
	if (isObject(v) && isString(v.code)) return v.code;
}

/** Get the string `.code` property from an object or error, or throw `AssertionError` if it doesn't exist. */
export function getErrorCode(v: unknown): string | undefined {
	const code = getOptionalErrorCode(v);
	if (typeof code !== "string") throw new AssertionError("Error code must be string", v);
	return code;
}
