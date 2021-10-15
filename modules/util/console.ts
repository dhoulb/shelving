import type { Catcher } from "./dispatch.js";

/**
 * Catch an error and log to the console.
 */
export const logError: Catcher = (err: Error | unknown): void => void console.error(err); // eslint-disable-line no-console
