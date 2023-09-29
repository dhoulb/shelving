/** Callback function that reports an error. */
export type Report = (reason: unknown) => void;

/** Log an error to the console. */
// eslint-disable-next-line no-console
export const logError: Report = reason => console.error(reason);
