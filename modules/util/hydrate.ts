import { AssertionError } from "../error/AssertionError.js";
import type { Class } from "./class.js";
import { Data, isData } from "./data.js";
import { ImmutableObject, isPlainObject } from "./object.js";
import { mapArray, mapObject, Transformable } from "./transform.js";

/**
 * A set of hydrations describes a set of string keys and the class constructor to be dehydrated and rehydrated.
 * - We can't use `class.name` because we don't know that the name of the class will survive minification.
 */
export type Hydrations = ImmutableObject<Class>;

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

/** A dehydrated object with a `_type` key. */
export type DehydratedObject<T extends Data> = T & { readonly _type: string };

/** Is an unknown value a dehydrated object with a `_type` key. */
const isDehydrated = <T extends Data>(v: DehydratedObject<T> | Data): v is DehydratedObject<T> => typeof v._type === "string";

/** Hydrates a value with a set of hydrations. */
export class Hydrator implements Transformable<unknown, unknown> {
	private _hydrations: Hydrations;
	constructor(hydrations: Hydrations) {
		this._hydrations = hydrations;
	}
	transform(value: unknown): unknown {
		if (value instanceof Array) return mapArray(value, this);
		if (isPlainObject(value)) {
			if (!isDehydrated(value)) return mapObject(value, this);
			const { _type, ...props } = value;
			const hydration = this._hydrations[_type];
			if (hydration) return { __proto__: hydration.prototype, ...mapObject(props, this) };
			throw new AssertionError(`Cannot hydrate "${_type}" object`, value);
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
		if (value instanceof Array) return mapArray(value, this);
		if (isPlainObject(value)) return mapObject(value, this);
		if (isData(value)) {
			for (const [_type, hydration] of Object.entries(this._hydrations)) if (value instanceof hydration) return { _type, ...mapObject(value, this) };
			throw new AssertionError(`Cannot dehydrate object`, value);
		}
		return value;
	}
}
