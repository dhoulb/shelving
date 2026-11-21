import { isArray } from "./array.js";
import { getPrototype, isObject } from "./object.js";

/**
 * Serialise any value to a stable string, for use as a cache key or fingerprint.
 * - Uses `JSON.stringify()`, so strings and keys are escaped correctly and it is fast.
 * - Sorts object properties by key at every depth, so the same properties in a different order give the same string.
 * - Encodes values that JSON cannot hold (`undefined`, symbols, functions, `NaN`, `Infinity`, bigints) as `{ "$type": "…" }` objects, so they do not vanish or turn into `null`.
 * - Encodes an object with its own `toString()` (like `Date`) as `{ "$type": "Date", "value": "…" }`.
 * - Treat the output as an opaque string. Only compare it for equality. Do not parse it or read data from it, because its format can change.
 *
 * @param value The value to serialise (any type is accepted).
 * @returns An opaque string that is the same for equal values.
 * @see https://shelving.cc/util/serialise/serialise
 */
export function serialise(value: unknown): string {
	return JSON.stringify(value, _replace);
}

/** `JSON.stringify()` replacer that tags non-JSON values and sorts object keys. */
function _replace(this: unknown, key: string, value: unknown): unknown {
	const original = (this as { readonly [key: string]: unknown })[key]; // Read the value before `toJSON()` runs.
	if (original === undefined) return { $type: "undefined" };
	if (typeof original === "number") return Number.isFinite(original) ? original : { $type: "number", value: original.toString() };
	if (typeof original === "bigint") return { $type: "bigint", value: original.toString() };
	if (typeof original === "symbol")
		return original.description ? { $type: "symbol", description: original.description } : { $type: "symbol" };
	if (typeof original === "function") return original.name ? { $type: "function", name: original.name } : { $type: "function" };
	if (isArray(original)) return original;
	if (isObject(original)) {
		const prototype = getPrototype(original);
		const type = prototype !== Object.prototype && prototype !== null ? prototype?.constructor?.name : undefined;
		if (type && original.toString !== Object.prototype.toString) return { $type: type, value: original.toString() };
		const sorted: { [key: string]: unknown } = type ? { $type: type } : {};
		for (const k of Object.keys(original).sort()) sorted[k] = (original as { readonly [key: string]: unknown })[k];
		return sorted;
	}
	return value;
}
