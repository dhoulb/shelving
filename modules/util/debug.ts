/* eslint-disable no-control-regex */

/** Note: try to avoid non-type imports in this file, it can easily cause circular imports. */
import type { ImmutableArray } from "./array.js";
import type { ImmutableMap } from "./map.js";
import type { ImmutableSet } from "./set.js";

/** Debug a random value as a string. */
export function debug(value: unknown, depth = 1): string {
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
		if (value instanceof Array) return debugArray(value, depth);
		if (value instanceof Map) return debugMap(value, depth);
		if (value instanceof Set) return debugSet(value, depth);
		return debugObject(value, depth);
	}
	return typeof value;
}

/** Debug a string. */
export const debugString = (value: string): string => `"${value.replace(ESCAPE_REGEXP, _escapeChar)}"`;
const ESCAPE_REGEXP = /[\x00-\x08\x0B-\x1F\x7F-\x9F"\\]/g; // Match control characters, `"` double quote, `\` backslash.
const ESCAPE_LIST: { [key: string]: string } = { '"': '\\"', "\\": "\\\\", "\r": "\\r", "\n": "\\n", "\t": "\\t", "\b": "\\b", "\f": "\\f", "\v": "\\v" };
const _escapeChar = (char: string): string => ESCAPE_LIST[char] || `\\x${char.charCodeAt(0).toString(16).padStart(2, "00")}`;

/** Debug an array. */
export function debugArray(value: ImmutableArray, depth = 1): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Array.prototype ? "" : prototype.constructor.name || "";
	const items = depth > 0 && value.length ? value.map(v => debug(v, depth - 1)).join(",\n\t") : "";
	return `${name ? `${name} ` : ""}${value.length ? `[\n\t${items}\n]` : "[]"}`;
}

/** Debug a set. */
export function debugSet(value: ImmutableSet, depth = 1): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Set.prototype ? "" : prototype.constructor.name || "Set";
	const items =
		depth > 0 && value.size
			? Array.from(value)
					.map(v => debug(v, depth - 1))
					.join(",\n\t")
			: "";
	return `${name}(value.size) ${items ? `{\n\t${items}\n}` : "{}"}`;
}

/** Debug a map. */
export function debugMap(value: ImmutableMap, depth = 1): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Map.prototype ? "" : prototype.constructor.name || "Map";
	const entries =
		depth > 0 && value.size
			? Array.from(value)
					.map(([k, v]) => `${debug(k)}: ${debug(v, depth - 1)}`)
					.join(",\n\t")
			: "";
	return `${name}(value.size) ${entries ? `{\n\t${entries}\n}` : "{}"}`;
}

/** Debug an object. */
export function debugObject(value: object, depth = 1): string {
	const prototype = Object.getPrototypeOf(value) as typeof value;
	const name = prototype === Object.prototype ? "" : prototype.constructor.name || "";
	const entries =
		depth > 0
			? Object.entries(value)
					.map(([k, v]) => `${debug(k)}: ${debug(v, depth - 1)}`)
					.join(",\n\t")
			: "";
	return `${name ? `${name} ` : ""}${entries ? `{\n\t${entries}\n}` : "{}"}`;
}
