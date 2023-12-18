import type { SchemaOptions } from "./Schema.js";
import type { Entry } from "../util/entry.js";
import type { ImmutableMap, PossibleMap, PossibleStringMap } from "../util/map.js";
import { Feedback } from "../feedback/Feedback.js";
import { getFirstItem } from "../util/array.js";
import { getMap, isMapItem } from "../util/map.js";
import { getString } from "../util/string.js";
import { Schema } from "./Schema.js";

/** Allowed options for `AllowSchama` */
export type AllowSchemaOptions<K, T> = Omit<SchemaOptions, "value"> & {
	/** Specify correct options using a `Map` or iterable set of entries. */
	allow: PossibleMap<K, T>;
};

/** Define a valid value from an allowed set of values. */
export class AllowSchema<K, T> extends Schema<K> implements Iterable<Entry<K, T>> {
	declare readonly value: K;
	readonly allow: ImmutableMap<K, T>;
	constructor(options: AllowSchemaOptions<K, T>) {
		const allow = getMap(options.allow);
		const value = getFirstItem(allow.keys());
		super({ value, ...options });
		this.allow = allow;
	}
	validate(unsafeValue: unknown = this.value): K {
		if (isMapItem(this.allow, unsafeValue)) return unsafeValue;
		throw new Feedback("Unknown value", unsafeValue);
	}

	/** Iterate over the the allowed options in `[key, value]` format. */
	[Symbol.iterator](): Iterator<Entry<K, T>> {
		return this.allow[Symbol.iterator]();
	}
}

/** Allowed options for `AllowStringSchama` */
export type AllowStringSchemaOptions<K extends string, T> = Omit<SchemaOptions, "value"> & {
	/** Specify correct options using a `Map`, iterable set of entries, or an object with string keys. */
	allow: PossibleStringMap<K, T>;
};

/** Define a valid string value from an allowed set of string values. */
export class AllowStringSchema<K extends string, T> extends AllowSchema<K, T> {
	constructor({ allow, ...options }: AllowStringSchemaOptions<K, T>) {
		super({ allow: getMap(allow), ...options });
	}
	validator(unsafeValue: unknown = this.value): K {
		return super.validate(getString(unsafeValue));
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
