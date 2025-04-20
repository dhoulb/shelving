import { ValidationError } from "../error/request/InputError.js";
import { isArray } from "./array.js";
import { getPrototype, isObject } from "./object.js";

const R_QUOTE = /"/g;

/**
 * Custom JSON.stringify()
 * - Not optimised for performance. Optimised for consistency!
 * - Allows returned values to be used for fingerprinting values of any type.
 * - Non-JSON-friendly values (like `null`, explicit `undefined`, symbols, functions) are converted to `{ $type: "symbol" }` style constructions.
 * - Objects with custom `toString()` properties assume that string is useful and return a value like `{ $type: "Date", value: "Wed Feb 24 2021 20:59:57 GMT+0000 (Greenwich Mean Time)" }`
 * - Object properties are sorted (by key) before output so they're always consistent.
 */
export function serialise(value: unknown): string {
	if (value === true) return "true";
	if (value === false) return "false";
	if (value === undefined) return '{"$type":"undefined"}';
	if (value === null) return "null";
	if (typeof value === "number") return value.toString();
	if (typeof value === "string") return _escapeString(value);
	if (typeof value === "symbol")
		return value.description ? `{"$type":"symbol","description":${_escapeString(value.description)}}` : '{"$type":"symbol"}';
	if (typeof value === "function") return value.name ? `{"$type":"function","name":${_escapeString(value.name)}}` : '{"$type":"function"}';
	if (isArray(value)) return `[${value.map(serialise).join(",")}]`;
	if (isObject(value)) {
		const prototype = getPrototype(value);
		const type = prototype !== Object.prototype && prototype !== null ? prototype?.constructor?.name : undefined;

		// Use custom `toString()` function if it's defined.
		if (type && value.toString !== Object.prototype.toString)
			return `{"$type":${_escapeString(type)},"value":${_escapeString(value.toString())}}`;

		// Otherwise crawl the object and sort the props ascendingly.
		const props = Object.entries(value).map(_serialiseEntry).sort();
		return `{${type ? `"$type":${_escapeString(type)}${props.length ? "," : ""}` : ""}${props.join(",")}}`;
	}
	throw new ValidationError("Cannot serialize value", value);
}

function _serialiseEntry([key, value]: [string, unknown]) {
	return `${_escapeString(key)}:${serialise(value)}`;
}

function _escapeString(str: string): string {
	return `"${str.replace(R_QUOTE, `\\"`)}"`;
}
