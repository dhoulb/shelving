import type { ImmutableObject } from "./object.js";

/** Debug a random value as a string. */
export const debug = (value: unknown): string =>
	typeof value === "function"
		? value.name
			? `${value.name}()`
			: "anonymous function"
		: value === null
		? "null"
		: value === true
		? "true"
		: value === false
		? "false"
		: typeof value === "object"
		? debugObject(value as ImmutableObject)
		: typeof value === "number"
		? value.toString()
		: typeof value === "string"
		? debugString(value)
		: typeof value;

const debugString = (value: string): string => (value.length > DEBUG_STRING_MAX ? `"${value.slice(0, DEBUG_STRING_MAX)}…"` : `"${value}"`);
const DEBUG_STRING_MAX = 23;

const debugObject = (value: ImmutableObject): string => {
	const prototype = Object.getPrototypeOf(value);
	return prototype?.constructor ? `instance of ${prototype.constructor.name || "anonymous class"}` : "plain object";
};
