import type { ImmutableArray } from "./array.js";
import type { Data, FlatData, FlatDataKey } from "./data.js";
import type { ImmutableObject } from "./object.js";
import { AssertionError } from "../error/AssertionError.js";
import { reduceItems } from "./iterate.js";
import { getNumber } from "./number.js";
import { getProps, isObject } from "./object.js";

/** Type of an update. */
export type UpdateType = "set" | "increment";

/** Set of named updates for a data object. */
export type Updates<T extends Data = Data> = {
	[K in FlatDataKey<T> as `${K}`]?: FlatData<T>[K]; // Set update.
} & {
	[K in FlatDataKey<T> as `${K}+=` | `${K}-=`]?: FlatData<T>[K] extends number ? FlatData<T>[K] : never; // Increment update.
};

/** A single update to a keyed property in an object. */
export interface Update {
	keys: ImmutableArray<string>;
	type: string;
	value: unknown;
}

/** Update that sets a prop. */
export interface SetUpdate extends Update {
	type: "set";
}

/** Update that updates a number prop. */
export interface SumUpdate extends Update {
	type: "sum";
	value: number;
}

/** Any update on a prop. */
export type PropUpdate = SetUpdate | SumUpdate;

/** Yield the prop updates in an `Updates` object as a set of `PropUpdate` objects. */
export function* getUpdates<T extends Data>(data: Updates<T>): Iterable<PropUpdate> {
	for (const [keys, value] of getProps<Data>(data)) {
		if (keys.endsWith("+=")) {
			yield { keys: keys.slice(0, -2).split("."), type: "sum", value: getNumber(value) };
		} else if (keys.endsWith("-=")) {
			yield { keys: keys.slice(0, -2).split("."), type: "sum", value: 0 - getNumber(value) };
		} else {
			yield { keys: keys.split("."), type: "set", value };
		}
	}
}

/** Update the named props in an object with a set of updates. */
export function updateObject<T extends ImmutableObject>(data: T, updates: Updates<T>): T {
	return reduceItems(getUpdates(updates), updateProp, data);
}

/** Update a prop with an `PropUpdate` object. */
export function updateProp<T extends ImmutableObject>(obj: T, update: PropUpdate, i = 0): T {
	const { keys, type, value } = update;
	const key = keys[i] as string;
	const oldValue = obj[key];
	let newValue: unknown = oldValue;
	if (i === keys.length - 1) {
		if (type === "sum") newValue = typeof oldValue === "number" ? oldValue + value : value;
		else if (type === "set") newValue = value;
		else return type; // Never happens.
	} else {
		if (!isObject(oldValue)) throw new AssertionError(`Prop "${keys.slice(0, i + 1).join(".")}"`);
		newValue = updateProp(oldValue, update, i + 1);
	}
	return oldValue === newValue ? obj : { ...obj, [key]: newValue };
}
