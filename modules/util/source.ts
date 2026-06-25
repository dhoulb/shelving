import { RequiredError } from "../error/RequiredError.js";
import type { Class } from "./class.js";
import type { AnyCaller } from "./function.js";
import { isObject } from "./object.js";

/**
 * Something that has a source of a specified type.
 *
 * @see https://shelving.cc/util/source/Sourceable
 */
export interface Sourceable<T> {
	/** The wrapped source object this object delegates to. */
	readonly source: T;
}

/**
 * Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or `undefined` if no source object matches.
 * - Follows the `source` property chain (e.g. layered providers) until a matching instance is found.
 *
 * @param type The class to search for an instance of.
 * @param value The object to start searching from.
 * @returns The first matching source instance, or `undefined` if none matches.
 * @see https://shelving.cc/util/source/getSource
 */
export function getSource<T>(type: Class<T>, value: unknown): T | undefined {
	if (isObject(value)) {
		if (value instanceof type) return value as unknown as T;
		if ("source" in value) return getSource(type, value.source);
	}
}

/**
 * Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or throw `RequiredError` if no source object matches.
 * - Like `getSource()`, but throws instead of returning `undefined` when no match is found.
 *
 * @param type The class to search for an instance of.
 * @param data The object to start searching from.
 * @param caller Function to attribute a thrown error to (defaults to `requireSource`).
 * @returns The first matching source instance.
 * @throws {RequiredError} If no source object is an instance of `type`.
 * @see https://shelving.cc/util/source/requireSource
 */
export function requireSource<T>(type: Class<T>, data: unknown, caller: AnyCaller = requireSource): T {
	const source = getSource(type, data);
	if (!source) throw new RequiredError(`Source "${type.name}" not found`, { received: data, expected: type, caller });
	return source;
}
