import { type ImmutableArray, isArray, omitArrayItems, withArrayItems } from "./array.js";
import type { BranchData, BranchKey, Data, DataProp, LeafData, LeafKey } from "./data.js";
import { reduceItems } from "./iterate.js";
import { requireNumber } from "./number.js";
import { getProps, isObject } from "./object.js";
import { isDefined } from "./undefined.js";

/**
 * Set of named updates for a data object.
 *
 * Note: string templates infer best when you have fixed character(s) at the start,
 *   so our `Update` syntax always
 */
export type Updates<T extends Data = Data> = {
	/**
	 * Set update (all branches)
	 * - Can set `a` and `a.a1` in `{ a: { a1: 123 } }`
	 * - Sometimes inference gets confused, if that happens use `=` syntax instead.
	 */
	readonly [K in BranchKey<T> as `${K}`]?: BranchData<T>[K] | undefined;
} & {
	/**
	 * Set update (leaves only)
	 * - Can set `a.a1` in `{ a: { a1: 123 } }`, but cannot set `a`
	 * - Deeply-nested properties don't always infer when leaves and branches are combined.
	 * - This syntax is more exact and will infer better.
	 */
	readonly [K in LeafKey<T> as `=${K}`]?: LeafData<T>[K] | undefined;
} & {
	/**
	 * Sum update.
	 * - Increment/decrement numbers.
	 */
	readonly [K in LeafKey<T> as `+=${K}` | `-=${K}`]?: LeafData<T>[K] extends number ? LeafData<T>[K] | undefined : never;
} & {
	/**
	 * With/omit update.
	 * - Add or remove items from arrays.
	 */
	readonly [K in LeafKey<T> as `+[]${K}` | `-[]${K}`]?: LeafData<T>[K] extends ImmutableArray<unknown>
		? LeafData<T>[K] | LeafData<T>[K][number] | undefined
		: never;
};

/** A single update to a keyed property in an object. */
export type Update =
	| { action: "set"; key: string; value: unknown } //
	| { action: "with"; key: string; value: ImmutableArray<unknown> } //
	| { action: "omit"; key: string; value: ImmutableArray<unknown> } //
	| { action: "sum"; key: string; value: number };

/** Yield the prop updates in an `Updates` object as a set of `Update` objects. */
export function getUpdates<T extends Data>(data: Updates<T>): ImmutableArray<Update> {
	return getProps(data).map(_getUpdate).filter(isDefined);
}
function _getUpdate([key, value]: DataProp<Updates>): Update | undefined {
	if (value !== undefined) {
		if (key.startsWith("+="))
			return { action: "sum", key: key.slice(2), value: requireNumber(value as number, undefined, undefined, getUpdates) };
		if (key.startsWith("-="))
			return { action: "sum", key: key.slice(2), value: 0 - requireNumber(value as number, undefined, undefined, getUpdates) };
		if (key.startsWith("=")) return { action: "set", key: key.slice(1), value };
		if (key.startsWith("+[]")) return { action: "with", key: key.slice(3), value: isArray(value) ? value : [value] };
		if (key.startsWith("-[]")) return { action: "omit", key: key.slice(3), value: isArray(value) ? value : [value] };
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
		else if (action === "with") newValue = isArray(oldValue) ? withArrayItems(oldValue, ...value) : value;
		else if (action === "omit") newValue = isArray(oldValue) ? omitArrayItems(oldValue, ...value) : [];
		else return action; // Never happens.
	} else {
		// Subkeys.
		newValue = _updatePropDeep(isObject(oldValue) ? oldValue : {}, update, keys, i + 1);
	}
	return oldValue === newValue ? obj : { ...obj, [k]: newValue };
}
