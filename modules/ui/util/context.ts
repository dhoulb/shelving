import { type Context, use } from "react";
import { RequiredError } from "../../error/RequiredError.js";
import type { AnyCaller } from "../../util/function.js";
import { type Nullish, notNullish } from "../../util/null.js";

/** Use the value of a React `Context`, or throw `RequiredError` if the context was unset. */
export function requireContext<T>(context: Context<T | null>, caller?: AnyCaller): T;
export function requireContext<T>(context: Context<T | undefined>, caller?: AnyCaller): T;
export function requireContext<T>(context: Context<T>, caller?: AnyCaller): T;
export function requireContext<T>(context: Context<Nullish<T>>, caller: AnyCaller = requireContext): T {
	const value = use(context);
	if (notNullish(value)) return value;
	const { displayName = "Context" } = context;
	throw new RequiredError(`${displayName} must be used inside <${displayName}>`, { caller });
}
