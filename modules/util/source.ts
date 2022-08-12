import { AssertionError } from "../error/AssertionError.js";
import type { Class } from "./class.js";
import { isData } from "./data.js";

/** Something that has a source of a specified type. */
export interface Sourceable<T> {
	readonly source: T;
}

/**
 * Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or `null` if no source object matches.
 */
export function getOptionalSource<T>(type: Class<T>, value: unknown): T | null {
	if (isData(value)) {
		if (value instanceof type) return value as unknown as T;
		if ("source" in value) return getOptionalSource(type, value.source);
	}
	return null;
}

/**
 * Recurse through `Sourceable` objects and return the first one that is an instance of `type`.
 */
export function getSource<T>(type: Class<T>, data: unknown): T {
	const source = getOptionalSource(type, data);
	if (!source) throw new AssertionError(`Source "${type.name}" not found`, data);
	return source;
}