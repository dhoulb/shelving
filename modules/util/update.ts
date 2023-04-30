import type { ImmutableArray } from "./array.js";
import type { Data, DataProp, FlatData, FlatDataKey } from "./data.js";
import { AssertionError } from "../error/AssertionError.js";
import { reduceItems } from "./iterate.js";
import { getNumber } from "./number.js";
import { getProps, isObject } from "./object.js";

/** Set of named updates for a data object. */
export type Updates<T extends Data = Data> = {
	readonly [K in FlatDataKey<T> as K | `${K}`]?: FlatData<T>[K]; // Set update.
} & {
	readonly [K in FlatDataKey<T> as `${K}+=` | `${K}-=`]?: FlatData<T>[K] extends number ? FlatData<T>[K] : never; // Increment update.
};

/** A single update to a keyed property in an object. */
export type Update =
	| { action: "set"; keys: ImmutableArray<string>; value: unknown } //
	| { action: "sum"; keys: ImmutableArray<string>; value: number };

/** Yield the prop updates in an `Updates` object as a set of `Update` objects. */
export function getUpdates<T extends Data>(data: Updates<T>): ImmutableArray<Update> {
	return getProps(data).map(_getUpdate);
}
function _getUpdate([keys, value]: DataProp<Data>): Update {
	if (keys.endsWith("+=")) return { action: "sum", keys: keys.slice(0, -2).split("."), value: getNumber(value) };
	else if (keys.endsWith("-=")) return { action: "sum", keys: keys.slice(0, -2).split("."), value: 0 - getNumber(value) };
	else return { action: "set", keys: keys.split("."), value };
}

/** Update a data object with a set of updates. */
export function updateData<T extends Data>(data: T, updates: Updates<T>): T {
	return reduceItems(getUpdates(updates), _updateProp, data);
}
function _updateProp<T extends Data>(obj: T, update: Update, i = 0): T {
	const { action, keys, value } = update;
	const key = keys[i];
	if (!key) return obj; // Shouldn't happen.
	const oldValue = obj[key];
	let newValue: unknown = oldValue;
	if (i === keys.length - 1) {
		if (action === "sum") newValue = typeof oldValue === "number" ? oldValue + value : value;
		else if (action === "set") newValue = value;
		else return action; // Never happens.
	} else {
		if (!isObject(oldValue)) throw new AssertionError(`Prop "${keys.slice(0, i + 1).join(".")}" is not an object`);
		newValue = _updateProp(oldValue, update, i + 1);
	}
	return oldValue === newValue ? obj : { ...obj, [key]: newValue };
}
