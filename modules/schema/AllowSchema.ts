import type { Entry } from "../util/entry.js";
import { getString } from "../util/string.js";
import { getRequiredMap, ImmutableRequiredMap, isMapKey, PossibleMap, PossibleStringMap } from "../util/map.js";
import { InvalidFeedback } from "../feedback/InvalidFeedback.js";
import { getFirstItem } from "../util/array.js";
import { Schema, SchemaOptions } from "./Schema.js";

/** Define a valid value from an allowed set of values. */
export class AllowSchema<K, T> extends Schema<K> implements Iterable<Entry<K, T>> {
	override readonly value: K;
	readonly allow: ImmutableRequiredMap<K, T>;
	constructor({
		allow,
		...options
	}: Omit<SchemaOptions, "value"> & {
		allow: PossibleMap<K, T>;
	}) {
		super(options);
		this.allow = getRequiredMap(allow);
		this.value = getFirstItem(this.allow.keys());
	}
	validate(value: unknown = this.value): K {
		if (isMapKey(this.allow, value)) return value;
		throw new InvalidFeedback("Unknown value", { value });
	}

	/** Iterate over the the allowed options in `[key, value]` format. */
	[Symbol.iterator](): Iterator<Entry<K, T>> {
		return this.allow[Symbol.iterator]();
	}
}

/** Define a valid string value from an allowed set of string values. */
export class AllowStringSchema<K extends string, T> extends AllowSchema<K, T> {
	constructor({
		allow,
		...options
	}: Omit<SchemaOptions, "value"> & {
		allow: PossibleStringMap<K, T>;
	}) {
		super({ allow: getRequiredMap(allow), ...options });
	}
	validator(value: unknown = this.value): K {
		return super.validate(getString(value));
	}
}

/** Valid value from an allowed set of values. */
export function ALLOW<K, T>(allow: PossibleMap<K, T>): AllowSchema<K, T> {
	return new AllowSchema({ allow });
}

/** Valid string from an allowed set of values. */
export function ALLOW_STRING<K extends string, T>(allow: PossibleStringMap<K, T>): AllowSchema<K, T> {
	return new AllowStringSchema({ allow });
}
