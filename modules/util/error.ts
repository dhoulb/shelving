/** Object that handles an error with its `error()` function, or a function that does the same. */
export type Handler = (reason: Error | unknown) => void;

/** Handle an error by logging it to the console. */
// eslint-disable-next-line no-console
export const logError: Handler = (reason: Error | unknown): void => void console.error(reason);
