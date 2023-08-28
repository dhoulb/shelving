import type { BranchData, BranchKey, Data, DataProp, LeafData, LeafKey } from "./data.js";
import { type ImmutableArray, isArray, omitArrayItems, withArrayItems } from "./array.js";
import { reduceItems } from "./iterate.js";
import { getNumber } from "./number.js";
import { getProps, isObject } from "./object.js";
import { isDefined } from "./undefined.js";

/** Set of named updates for a data object. */
export type Updates<T extends Data = Data> = {
	readonly [K in BranchKey<T> as `${K}`]?: BranchData<T>[K] | undefined; // Set update.
} & {
	readonly [K in LeafKey<T> as `=${K}`]?: LeafData<T>[K] | undefined; // Set update.
} & {
	readonly [K in LeafKey<T> as `+=${K}` | `-=${K}`]?: LeafData<T>[K] extends number ? LeafData<T>[K] | undefined : never; // Sum update.
} & {
	readonly [K in LeafKey<T> as `+[]${K}` | `-[]${K}`]?: LeafData<T>[K] extends ImmutableArray<unknown> ? LeafData<T>[K] | undefined : never; // With/omit update.
};

/** A single update to a keyed property in an object. */
export type Update =
	| { action: "set"; key: string; value: unknown } //
	| { action: "with"; key: string; value: unknown } //
	| { action: "omit"; key: string; value: unknown } //
	| { action: "sum"; key: string; value: number };

/** Yield the prop updates in an `Updates` object as a set of `Update` objects. */
export function getUpdates<T extends Data>(data: Updates<T>): ImmutableArray<Update> {
	return getProps(data).map(_getUpdate).filter(isDefined);
}
function _getUpdate([key, value]: DataProp<Updates>): Update | undefined {
	if (value !== undefined) {
		if (key.startsWith("+=")) return { action: "sum", key: key.slice(2), value: getNumber(value) };
		if (key.startsWith("-=")) return { action: "sum", key: key.slice(2), value: 0 - getNumber(value) };
		if (key.startsWith("=")) return { action: "set", key: key.slice(1), value };
		if (key.startsWith("+[]")) return { action: "with", key: key.slice(3), value };
		if (key.startsWith("-[]")) return { action: "omit", key: key.slice(3), value };
		return { action: "set", key, value };
	}
}

/** Update a data object with a set of updates. */
export function updateData<T extends Data>(data: T, updates: Updates<T>): T {
	return reduceItems(getUpdates(updates), _updateProp, data);
}
function _updateProp<T extends Data>(obj: T, update: Update): T {
	return _updatePropDeep(obj, update, update.key.split("."), 0);
}
function _updatePropDeep<T extends Data>(obj: T, update: Update, keys: ImmutableArray<string>, i: number): T {
	const { action, value } = update;
	const k = keys[i];
	if (!k) return obj; // Shouldn't happen.
	const oldValue = obj[k];
	let newValue: unknown = oldValue;
	if (i === keys.length - 1) {
		// Final key.
		if (action === "sum") newValue = typeof oldValue === "number" ? oldValue + value : value;
		else if (action === "set") newValue = value;
		else if (action === "with") newValue = isArray(oldValue) ? withArrayItems(oldValue, value) : [value];
		else if (action === "omit") newValue = isArray(oldValue) ? omitArrayItems(oldValue, value) : [];
		else return action; // Never happens.
	} else {
		// Subkeys.
		newValue = _updatePropDeep(isObject(oldValue) ? oldValue : {}, update, keys, i + 1);
	}
	return oldValue === newValue ? obj : { ...obj, [k]: newValue };
}
