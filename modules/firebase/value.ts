import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray } from "../util/array.js";
import { isArray } from "../util/array.js";
import type { Data } from "../util/data.js";
import type { AnyCaller } from "../util/function.js";
import { isPlainObject } from "../util/object.js";

/** JSON representation of a single value in the Firestore REST API. */
export type FirestoreValue = {
	readonly nullValue?: null;
	readonly booleanValue?: boolean;
	readonly integerValue?: string | number;
	readonly doubleValue?: string | number;
	readonly stringValue?: string;
	readonly timestampValue?: string;
	readonly bytesValue?: string;
	readonly referenceValue?: string;
	readonly geoPointValue?: { readonly latitude?: number; readonly longitude?: number };
	readonly arrayValue?: { readonly values?: ImmutableArray<FirestoreValue> };
	readonly mapValue?: { readonly fields?: FirestoreFields };
};

/** JSON representation of the fields of a Firestore document in the Firestore REST API. */
export type FirestoreFields = { readonly [key: string]: FirestoreValue };

/**
 * Convert a data value to its Firestore REST API JSON representation.
 *
 * - Safe integers become `integerValue` (which the REST API encodes as a string), other finite numbers become `doubleValue`.
 * - Arrays and plain objects convert recursively.
 *
 * @param value The value to convert (null, boolean, string, finite number, array, or plain object).
 * @param caller Caller function used to attribute thrown errors.
 * @returns The Firestore JSON value.
 * @throws `ValueError` if the value cannot be represented (e.g. `undefined`, functions, non-finite numbers, class instances).
 * @example toFirestoreValue(123) // { integerValue: "123" }
 * @see https://shelving.cc/firebase/toFirestoreValue
 */
export function toFirestoreValue(value: unknown, caller: AnyCaller = toFirestoreValue): FirestoreValue {
	if (value === null) return { nullValue: null };
	if (typeof value === "boolean") return { booleanValue: value };
	if (typeof value === "string") return { stringValue: value };
	if (typeof value === "number") {
		if (Number.isSafeInteger(value)) return { integerValue: value.toString() };
		if (Number.isFinite(value)) return { doubleValue: value };
		throw new ValueError("Cannot convert non-finite number to Firestore value", { received: value, caller });
	}
	if (isArray(value)) return { arrayValue: { values: value.map(v => toFirestoreValue(v, caller)) } };
	if (isPlainObject(value)) return { mapValue: { fields: toFirestoreFields(value, caller) } };
	throw new ValueError("Cannot convert value to Firestore value", { received: value, caller });
}

/**
 * Convert a data object to Firestore REST API document fields.
 *
 * - Props with `undefined` value are skipped (matching JSON serialisation).
 *
 * @param data The data object to convert.
 * @param caller Caller function used to attribute thrown errors.
 * @returns The Firestore fields object.
 * @throws `ValueError` if any prop value cannot be represented.
 * @example toFirestoreFields({ num: 123 }) // { num: { integerValue: "123" } }
 * @see https://shelving.cc/firebase/toFirestoreFields
 */
export function toFirestoreFields(data: Data, caller: AnyCaller = toFirestoreFields): FirestoreFields {
	const fields: { [key: string]: FirestoreValue } = {};
	for (const [key, value] of Object.entries(data)) if (value !== undefined) fields[key] = toFirestoreValue(value, caller);
	return fields;
}

/**
 * Convert a Firestore REST API JSON value back to a data value.
 *
 * - `integerValue` parses to a `number`, so integers beyond `Number.MAX_SAFE_INTEGER` lose precision.
 * - `timestampValue`, `bytesValue`, and `referenceValue` pass through as their string form; `geoPointValue` becomes a plain `{ latitude, longitude }` object — wrap the provider in `ValidationDBProvider` to reject types your schemas don't allow.
 *
 * @param value The Firestore JSON value to convert.
 * @param caller Caller function used to attribute thrown errors.
 * @returns The plain data value.
 * @throws `ValueError` if the value has no recognised type.
 * @example toDataValue({ integerValue: "123" }) // 123
 * @see https://shelving.cc/firebase/toDataValue
 */
export function toDataValue(value: FirestoreValue, caller: AnyCaller = toDataValue): unknown {
	if ("nullValue" in value) return null;
	if (value.booleanValue !== undefined) return value.booleanValue;
	if (value.stringValue !== undefined) return value.stringValue;
	if (value.integerValue !== undefined) return typeof value.integerValue === "number" ? value.integerValue : Number(value.integerValue);
	if (value.doubleValue !== undefined) return typeof value.doubleValue === "number" ? value.doubleValue : Number(value.doubleValue);
	if (value.timestampValue !== undefined) return value.timestampValue;
	if (value.bytesValue !== undefined) return value.bytesValue;
	if (value.referenceValue !== undefined) return value.referenceValue;
	if (value.geoPointValue) return { latitude: value.geoPointValue.latitude ?? 0, longitude: value.geoPointValue.longitude ?? 0 };
	if (value.arrayValue) return (value.arrayValue.values ?? []).map(v => toDataValue(v, caller));
	if (value.mapValue) return toData(value.mapValue.fields, caller);
	throw new ValueError("Cannot convert Firestore value to value", { received: value, caller });
}

/**
 * Convert Firestore REST API document fields back to a data object.
 *
 * @param fields The Firestore fields object to convert (missing means an empty document).
 * @param caller Caller function used to attribute thrown errors.
 * @returns The plain data object.
 * @throws `ValueError` if any field value has no recognised type.
 * @example toData({ num: { integerValue: "123" } }) // { num: 123 }
 * @see https://shelving.cc/firebase/toData
 */
export function toData(fields: FirestoreFields | undefined, caller: AnyCaller = toData): Data {
	const data: { [key: string]: unknown } = {};
	for (const [key, value] of Object.entries(fields ?? {})) data[key] = toDataValue(value, caller);
	return data;
}
