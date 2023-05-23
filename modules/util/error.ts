/** Handle an error by logging it to the console. */
import type { ErrorCallback } from "./callback.js";

// eslint-disable-next-line no-console
export const logError: ErrorCallback = reason => console.error(reason);
