import { ValidationError } from "../error/request/InputError.js";
import type { Class } from "./class.js";
import { isObject } from "./object.js";

/** Something that has a source of a specified type. */
export interface Sourceable<T> {
	readonly source: T;
}

/**
 * Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or `null` if no source object matches.
 */
export function getOptionalSource<T>(type: Class<T>, value: unknown): T | undefined {
	if (isObject(value)) {
		if (value instanceof type) return value as unknown as T;
		if ("source" in value) return getOptionalSource(type, value.source);
	}
}

/**
 * Recurse through `Sourceable` objects and return the first one that is an instance of `type`.
 */
export function getSource<T>(type: Class<T>, data: unknown): T {
	const source = getOptionalSource(type, data);
	if (!source) throw new ValidationError(`Source "${type.name}" not found`, data);
	return source;
}
