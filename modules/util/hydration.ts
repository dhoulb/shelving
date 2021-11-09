import type { AnyClass } from "./class.js";
import { ImmutableObject, isObject, isPlainObject, mapProps } from "./object.js";
import { isArray, mapItems } from "./array.js";
import { debug } from "./debug.js";

/**
 * A set of hydrations describes a set of string keys and the class constructor to be dehydrated and rehydrated.
 * - We can't use `class.name` because we don't know that the name of the class will survive minification.
 */
export type Hydrations = ImmutableObject<AnyClass>;

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
	if (isArray(value)) return mapItems(value, v => dehydrate(v, hydrations));
	if (isPlainObject(value)) return mapProps(value, v => dehydrate(v, hydrations));
	if (isObject(value)) {
		for (const [_type, Class] of Object.entries(hydrations))
			if (value instanceof Class) return { _type, ...mapProps(value, v => dehydrate(v, hydrations)) };
		throw Error(`dehydrate(): Cannot dehydrate ${debug(value)}`);
	}
	return value;
}

/**
 * Deeply hydrate a class instance based on a set of `Hydrations`
 * - Hydration allows a client to receive class instances from a server.
 * - By its nature hydration is an unsafe operation.
 * - Deeply iterates into arrays and plain objects to hydrate their items and props too.
 * - Note: the recursion in this function does not currently protect against infinite loops.
 */
export function hydrate(value: unknown, hydrations: Hydrations): unknown {
	if (isArray(value)) return mapItems(value, v => hydrate(v, hydrations));
	if (isDehydratedObject(value)) {
		const { _type, ...props } = value;
		const Class = hydrations[_type];
		if (Class) return { __proto__: Class.prototype, ...mapProps(props, v => hydrate(v, hydrations)) };
		throw Error(`hydrate(): No hydrator for object with type "${_type}"`);
	}
	if (isPlainObject(value)) return mapProps(value, v => hydrate(v, hydrations));
	return value;
}

/** A dehydrated object with a `_type` key. */
export type DehydratedObject<T extends ImmutableObject> = T & { readonly _type: string };

/** Is an unknown value a dehydrated object with a `_type` key. */
export const isDehydratedObject = <T extends ImmutableObject>(v: DehydratedObject<T> | unknown): v is DehydratedObject<T> =>
	isPlainObject(v) && typeof v._type === "string";
