/* eslint-disable @typescript-eslint/ban-types */

/**
 * Fingerprint an unknown value as a string.
 * - Strings use `JSON.stringify(string)`
 * - Numbers use `Number.toString()`
 * - Symbols use `Symbol.toString()`
 * - `true`, `false`, `null`, `undefined` use `"true"` etc.
 * - Functions use the name of the function or `Function.toString()` if it's an anonymous function.
 * - Objects and arrays use either the custom `.toString()` of the object (e.g. for `Date` objects) or the `JSON.stringify()` version of the object.
 * - Anything else uses `unknown` (shouldn't happen).
 */
export const fingerprint = (value: unknown): string =>
	value === undefined
		? "undefined"
		: value === true
		? "true"
		: value === false
		? "false"
		: value === null
		? "null"
		: typeof value === "string"
		? JSON.stringify(value)
		: typeof value === "number"
		? value.toString()
		: typeof value === "symbol"
		? value.toString()
		: typeof value === "function"
		? fingerprintFunction(value)
		: value instanceof Array
		? fingerprintArray(value)
		: typeof value === "object"
		? fingerprintObject(value as object)
		: "unknown";

const fingerprintFunction = (value: Function): string => (value.name ? `${value.name}()` : value.toString());
const fingerprintEntry = ([key, value]: [string, unknown]): string => `${JSON.stringify(key)}:${fingerprint(value)}`;
const fingerprintArray = (value: unknown[]): string => `[${value.map(fingerprint).join(",")}]`;
const fingerprintObject = (value: object) =>
	value.toString !== Object.prototype.toString ? value.toString() : `{${Object.entries(value).map(fingerprintEntry).join(",")}}`;
