import { RequiredError } from "../error/RequiredError.js";
import { type Data, getDataProps, isData } from "./data.js";
import type { AnyCaller } from "./function.js";
import { requireString } from "./string.js";
import { isDefined } from "./undefined.js";

/**
 * Escape a string for safe inclusion in XML text content or attribute values.
 *
 * @param value The raw string value.
 * @returns The escaped XML-safe string.
 *
 * @example
 * escapeXML(`Tom & "Jerry"`)
 */
export function escapeXML(value: string): string {
	return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&apos;");
}

/**
 * Build an XML string from a data object.
 *
 * - Only data objects can be converted directly because XML requires named root and child elements.
 * - `undefined` values are omitted from the output.
 * - Nested data objects become nested XML elements.
 *
 * @param data The data object to serialize.
 * @param caller The calling function for error context.
 * @returns The serialized XML string.
 *
 * @throws {RequiredError} If a key is not a valid XML element name.
 * @throws {RequiredError} If a value cannot be converted to XML.
 *
 * @example
 * getXML({ user: { name: "Alice", age: 30 } })
 */
export function getXML(data: Data, caller: AnyCaller = getXML): string {
	return Array.from(_yieldXML(data, caller)).join("");
}

function* _yieldXML(data: Data, caller: AnyCaller): Iterable<string> {
	for (const [key, value] of getDataProps(data)) {
		if (!R_XML_KEY.test(key)) throw new RequiredError("Invalid XML key", { received: key, caller });
		if (isDefined(value)) yield `<${key}>${_getXMLValue(value, caller)}</${key}>`;
	}
}

function _getXMLValue(value: unknown, caller: AnyCaller): string {
	if (typeof value === "string") return escapeXML(value);
	if (typeof value === "number" || typeof value === "boolean") return requireString(value, undefined, undefined, caller);
	if (isData(value)) return getXML(value, caller);
	throw new RequiredError("Value cannot be converted to XML", { received: value, caller });
}

const R_XML_KEY = /^[a-z][a-z0-9]*$/i;
