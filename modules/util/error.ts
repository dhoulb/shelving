/** Handle an error by logging it to the console. */
import type { Handler } from "./function.js";

// eslint-disable-next-line no-console
export const logError: Handler = reason => console.error(reason);
