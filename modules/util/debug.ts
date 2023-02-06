/* eslint-disable no-control-regex */

/** Note: try to avoid non-type imports in this file, it can easily cause circular imports. */
import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableSet } from "./set.js";
import type { ImmutableObject } from "./object.js";

/** Debug a random value as a string. */
export function debug(value: unknown): string {
	if (value === null) return "null";
	if (value === undefined) return "undefined";
	if (typeof value === "boolean") return value ? "true" : "false";
	if (typeof value === "string") return debugString(value);
	if (typeof value === "number") return value.toString();
	if (typeof value === "symbol") return value.toString();
	if (typeof value === "function") return `function ${value.name || ""}()`;
	if (typeof value === "object") {
		if (value instanceof Date) return value.toISOString();
		if (value instanceof Error) return value.toString();
		if (value instanceof Array) return debugArray(value);
		if (value instanceof Map) return debugMap(value);
		if (value instanceof Set) return debugSet(value);
		return debugObject(value as ImmutableObject);
	}
	return typeof value;
}

/** Debug a string. */
export const debugString = (value: string): string => `"${value.replace(ESCAPE_REGEXP, _escapeChar)}"`;
const ESCAPE_REGEXP = /[\x00-\x08\x0B-\x1F\x7F-\x9F"\\]/g; // Match control characters, `"` double quote, `\` backslash.
const ESCAPE_LIST: { [key: string]: string } = { '"': '\\"', "\\": "\\\\", "\r": "\\r", "\n": "\\n", "\t": "\\t", "\b": "\\b", "\f": "\\f", "\v": "\\v" };
const _escapeChar = (char: string): string => ESCAPE_LIST[char] || `\\x${char.charCodeAt(0).toString(16).padStart(2, "00")}`;

/** Debug an array. */
export function debugArray(value: ImmutableArray): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Array.prototype ? "" : prototype.constructor.name || "";
	return `${name ? `${name} ` : ""}${value.length ? `[\n\t${value.map(debug).join(",\n\t")}\n]` : "[]"}`;
}

/** Debug a set. */
export function debugSet(value: ImmutableSet): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Set.prototype ? "" : prototype.constructor.name || "Set";
	return `${name}(value.size) ${value.size ? `{\n\t${Array.from(value).map(debug).join(",\n\t")}\n}` : "{}"}`;
}

/** Debug a map. */
export function debugMap(value: ImmutableMap): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Map.prototype ? "" : prototype.constructor.name || "Map";
	return `${name}(value.size) ${value.size ? `{\n\t${Array.from(value).map(_debugProp).join(",\n\t")}\n}` : "{}"}`;
}

/** Debug an object. */
export function debugObject(value: ImmutableObject): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Object.prototype ? "" : prototype.constructor.name || "";
	const props = Object.entries(value).map(_debugProp);
	return `${name ? `${name} ` : ""}${props.length ? `{\n\t${props.join(",\n\t")}\n}` : "{}"}`;
}

/** Debug a prop. */
const _debugProp = ([key, value]: readonly [unknown, unknown]) => `${debug(key)}: ${debug(value)}`;
