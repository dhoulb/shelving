import { type Context, use } from "react";
import { RequiredError } from "../../error/RequiredError.js";
import type { AnyCaller } from "../../util/function.js";
import { type Nullish, notNullish } from "../../util/null.js";

/**
 * Use the value of a React `Context`, or throw `RequiredError` if the context was unset.
 *
 * - Reads the context with React's `use()`, so it must be called inside a component or hook.
 * - Treats both `null` and `undefined` as "unset" and throws, naming the context's `displayName` in the message.
 *
 * @param context The React `Context` to read the current value of.
 * @param caller Function to attribute the thrown `RequiredError` to (defaults to `requireContext`).
 * @returns The current context value, guaranteed non-nullish.
 * @throws RequiredError If the context value is `null` or `undefined` (i.e. used outside its provider).
 * @example const theme = requireContext(ThemeContext);
 * @see https://dhoulb.github.io/shelving/ui/util/context/requireContext
 */
export function requireContext<T>(context: Context<T | null>, caller?: AnyCaller): T;
export function requireContext<T>(context: Context<T | undefined>, caller?: AnyCaller): T;
export function requireContext<T>(context: Context<T>, caller?: AnyCaller): T;
export function requireContext<T>(context: Context<Nullish<T>>, caller: AnyCaller = requireContext): T {
	const value = use(context);
	if (notNullish(value)) return value;
	const { displayName = "Context" } = context;
	throw new RequiredError(`${displayName} must be used inside <${displayName}>`, { caller });
}
