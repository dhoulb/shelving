import { RequiredError } from "../error/RequiredError.js";
import type { Class } from "./class.js";
import type { AnyCaller } from "./function.js";
import { isObject } from "./object.js";

/** Something that has a source of a specified type. */
export interface Sourceable<T> {
	readonly source: T;
}

/** Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or `undefined` if no source object matches. */
export function getSource<T>(type: Class<T>, value: unknown): T | undefined {
	if (isObject(value)) {
		if (value instanceof type) return value as unknown as T;
		if ("source" in value) return getSource(type, value.source);
	}
}

/** Recurse through `Sourceable` objects and return the first one that is an instance of `type`, or throw `RequiredError` if no source object matches. */
export function requireSource<T>(type: Class<T>, data: unknown, caller: AnyCaller = requireSource): T {
	const source = getSource(type, data);
	if (!source) throw new RequiredError(`Source "${type.name}" not found`, { received: data, expected: type, caller });
	return source;
}
