import { AssertionError } from "../error/AssertionError.js";
import type { ImmutableDictionary } from "./dictionary.js";
import type { Class } from "./class.js";
import { isArray } from "./array.js";
import { isDate } from "./date.js";
import { isMap } from "./map.js";
import { ImmutableObject, isObject, isPlainObject } from "./object.js";
import { isSet } from "./set.js";
import { isString } from "./string.js";
import { mapArray, mapObject, mapEntries, mapItems, Transformable } from "./transform.js";

/**
 * A set of hydrations describes a set of string keys and the class constructor to be dehydrated and rehydrated.
 * - We can't use `class.name` because we don't know that the name of the class will survive minification.
 */
export type Hydrations = ImmutableDictionary<Class>;

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
	return new Dehydrator(hydrations).transform(value);
}

/**
 * Deeply hydrate a class instance based on a set of `Hydrations`
 * - Hydration allows a client to receive class instances from a server.
 * - By its nature hydration is an unsafe operation.
 * - Deeply iterates into arrays and plain objects to hydrate their items and props too.
 * - Note: the recursion in this function does not currently protect against infinite loops.
 */
export function hydrate(value: unknown, hydrations: Hydrations): unknown {
	return new Hydrator(hydrations).transform(value);
}

/** A dehydrated object with a `$type` key. */
export type DehydratedObject = { readonly $type: string; readonly $value: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

/** Is an unknown value a dehydrated object with a `$type` key. */
const isDehydrated = (v: DehydratedObject | ImmutableObject): v is DehydratedObject => isString(v.$type);

/** Hydrates a value with a set of hydrations. */
export class Hydrator implements Transformable<unknown, unknown> {
	private _hydrations: Hydrations;
	constructor(hydrations: Hydrations) {
		this._hydrations = hydrations;
	}
	transform(value: unknown): unknown {
		if (isArray(value)) return mapArray(value, this);
		if (isPlainObject(value)) {
			if (!isDehydrated(value)) return mapObject(value, this);
			const { $type, $value } = value;
			if ($type === "Map") return new Map($value);
			if ($type === "Set") return new Set($value);
			if ($type === "Date") return new Date($value);
			const hydration = this._hydrations[$type];
			if (hydration) return { __proto__: hydration.prototype, ...mapObject($value, this) };
			throw new AssertionError(`Cannot hydrate "${$type}" object`, value);
		}
		return value;
	}
}

/** Dehydrates a value with a set of hydrations. */
export class Dehydrator implements Transformable<unknown, unknown> {
	private _hydrations: Hydrations;
	constructor(hydrations: Hydrations) {
		this._hydrations = hydrations;
	}
	transform(value: unknown): unknown {
		if (isArray(value)) return mapArray(value, this);
		if (isMap(value)) return { $type: "Map", $value: Array.from(mapEntries(value.entries(), this)) };
		if (isSet(value)) return { $type: "Set", $value: Array.from(mapItems(value.values(), this)) };
		if (isDate(value)) return { $type: "Date", $value: value.getTime() };
		if (isObject(value)) {
			const proto = Object.getPrototypeOf(value);
			if (proto === Object.prototype || proto === null) return mapObject(value, this);
			for (const [$type, hydration] of Object.entries(this._hydrations)) if (proto === hydration.prototype) return { $type, $value: mapObject(value, this) };
			throw new AssertionError(`Cannot dehydrate object`, value);
		}
		return value;
	}
}
