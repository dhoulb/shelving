/** Object that handles an error with its `error()` function. */
export interface Handlable {
	error(reason: Error | unknown): void;
}

/** Object that handles an error with its `error()` function, or a function that does the same. */
export type Handler = Handlable | ((reason: Error | unknown) => void);

/** Handle an error using a `Handler` */
export function handle(handler: Handler, reason: Error | unknown): void {
	try {
		if (typeof handler === "function") handler(reason);
		else if (handler.error) handler.error(reason);
	} catch (thrown) {
		logError(thrown);
	}
}

/** Handle an error by logging it to the console. */
// eslint-disable-next-line no-console
export const logError = (reason: Error | unknown): void => void console.error(reason);
