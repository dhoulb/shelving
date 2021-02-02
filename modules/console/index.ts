import { ErrorDispatcher } from "../dispatch";

/**
 * Catch an error and log to the console.
 */
export const logError: ErrorDispatcher = (err: Error | unknown): void => void console.error(err); // eslint-disable-line no-console
