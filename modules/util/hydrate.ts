import type { Class } from "./class.js";
import type { ImmutableDictionary } from "./dictionary.js";
import type { ImmutableObject } from "./object.js";
import { ValueError } from "../error/ValueError.js";
import { isArray } from "./array.js";
import { isDate } from "./date.js";
import { isMap } from "./map.js";
import { getProps, getPrototype, isObject, isPlainObject } from "./object.js";
import { isSet } from "./set.js";
import { isString } from "./string.js";
import { mapArray, mapObject } from "./transform.js";

/**
 * A set of hydrations describes a set of string keys and the class constructor to be dehydrated and rehydrated.
 * - We can't use `class.name` because we don't know that the name of the class will survive minification.
 */
export type Hydrations = ImmutableDictionary<Class<unknown>>;

/** A dehydrated object with a `$type` key. */
export type DehydratedObject = { readonly $type: string; readonly $value: unknown };

/** Is an unknown value a dehydrated object with a `$type` key. */
const isDehydrated = (value: DehydratedObject | ImmutableObject): value is DehydratedObject => isString(value.$type);

/**
 * Deeply hydrate a class instance based on a set of `Hydrations`
 * - Hydration allows a client to receive class instances from a server.
 * - By its nature hydration is an unsafe operation.
 * - Deeply iterates into arrays and plain objects to hydrate their items and props too.
 * - Note: the recursion in this function does not currently protect against infinite loops.
 */
export function hydrate(value: unknown, hydrations: Hydrations): unknown {
	if (isArray(value)) return mapArray(value, hydrate, hydrations);
	if (isPlainObject(value)) {
		if (!isDehydrated(value)) return mapObject(value, hydrate, hydrations);
		const { $type, $value } = value;
		if ($type === "Map") return new Map($value as ConstructorParameters<typeof Map>[0]);
		if ($type === "Set") return new Set($value as ConstructorParameters<typeof Set>[0]);
		if ($type === "Date") return new Date($value as ConstructorParameters<typeof Date>[0]);
		const hydration = hydrations[$type];
		if (hydration) return { __proto__: hydration.prototype as unknown, ...mapObject($value as ImmutableObject, hydrate, hydrations) };
		throw new ValueError(`Cannot hydrate "${$type}" object`, value);
	}
	return value;
}

/**
 * Deeply dehydrate a class instance based on a set of `Hydrations`
 * - Dehydration allows you to pass class instances from a server back to a client.
 * - By its nature dehydration is an unsafe operation.
 * - Deeply iterates into arrays and plain objects to dehydrate their items and props too.
 * - Note: the recursion in this function does not currently protect against infinite loops.
 *
 * @returns The dehydrated version of the specified value.
 * @throws `Error` if the value is a class instance that cannot be dehydrated (i.e. is not matched by any constructor in `hydrations`).
 */
export function dehydrate(value: unknown, hydrations: Hydrations): unknown {
	if (isObject(value)) {
		if (isArray(value)) return mapArray(value, dehydrate, hydrations);
		else if (isMap(value)) return { $type: "Map", $value: mapArray(value.entries(), dehydrate, hydrations) };
		else if (isSet(value)) return { $type: "Set", $value: mapArray(value.values(), dehydrate, hydrations) };
		else if (isDate(value)) return { $type: "Date", $value: value.getTime() };
		else if (isPlainObject(value)) return mapObject(value, dehydrate, hydrations);
		else {
			const proto = getPrototype(value);
			for (const [$type, hydration] of getProps(hydrations)) if (proto === hydration.prototype) return { $type, $value: mapObject(value, dehydrate, hydrations) };
			throw new ValueError(`Cannot dehydrate object`, value);
		}
	}
	return value;
}
