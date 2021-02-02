import { ImmutableObject } from "../object";

/** Debug a random value as a string. */
export const debug = (value: unknown): string =>
	typeof value === "function"
		? value.name
			? `${value.name}()`
			: "anonymous function"
		: value === null
		? "null"
		: typeof value === "object"
		? debugObject(value as ImmutableObject)
		: typeof value;

const debugObject = (value: ImmutableObject): string => {
	const prototype = Object.getPrototypeOf(value);
	return prototype?.constructor ? `instance of ${prototype.constructor.name || "anonymous class"}` : "plain object";
};
