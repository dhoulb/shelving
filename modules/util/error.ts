/** Callback function that handles an error (naming matches `RequestHandler`). */
export type Report = (reason: unknown) => void;

/** Log an error to the console. */
export function logError(reason: unknown): void {
	console.error(reason);
}

/** Is an unknown value an `Error` instance? */
export function isError(v: unknown): v is Error & { readonly code?: string | undefined } {
	return typeof Error.isError === "function" ? Error.isError(v) : v instanceof Error;
}
