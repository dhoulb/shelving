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
		if (value instanceof Request) return debugRequest(value);
		if (value instanceof Response) return debugResponse(value);
		if (value instanceof Headers) return debugHeaders(value);
		// biome-ignore lint/suspicious/useIsArray: Intential in this context.
		if (value instanceof Array) return debugArray(value, depth);
		if (value instanceof Map) return debugMap(value, depth);
		if (value instanceof Set) return debugSet(value, depth);
		return debugObject(value, depth);
	}
	return typeof value;
}

/** Debug a string. */
export const debugString = (value: string): string => `"${value.replace(ESCAPE_REGEXP, _escapeChar)}"`;
// biome-ignore lint/suspicious/noControlCharactersInRegex: Intentional.
const ESCAPE_REGEXP = /[\x00-\x08\x0B-\x1F\x7F-\x9F"\\]/g; // Match control characters, `"` double quote, `\` backslash.
const ESCAPE_LIST: { [key: string]: string } = {
	'"': '\\"',
	"\\": "\\\\",
	"\r": "\\r",
	"\n": "\\n",
	"\t": "\\t",
	"\b": "\\b",
	"\f": "\\f",
	"\v": "\\v",
};
const _escapeChar = (char: string): string => ESCAPE_LIST[char] || `\\x${char.charCodeAt(0).toString(16).padStart(2, "00")}`;

/** Debug a set of `Headers` as a string. */
export function debugHeaders(headers: Headers): string {
	return Array.from(headers, ([key, value]) => `${key}: ${value}`).join("\n");
}

/**
 * Debug a full `Request` as a string including its body.
 * - Clones the request before reading the body so the original request can still be sent or parsed later.
 * - Omits the body section when the request body is empty.
 */
export async function debugFullRequest(request: Request): Promise<string> {
	return _debugFullMessage(debugRequest(request), request);
}

/**
 * Debug a full `Response` as a string including its headers and body.
 * - Clones the response before reading the body so the original response can still be parsed later.
 * - Omits the headers section when there are no headers.
 * - Omits the body section when the response body is empty.
 */
export async function debugFullResponse(response: Response): Promise<string> {
	return _debugFullMessage(debugResponse(response), response);
}

async function _debugFullMessage(head: string, message: Request | Response): Promise<string> {
	const headers = debugHeaders(message.headers);
	const body = await _debugMessageBody(message);
	return `${head}${headers && `\n${headers}`}${body && `\n\n${body}`}`;
}

/** Maximum bytes read from a Request/Response body when debugging. Caps memory and prevents hangs on streaming bodies. */
const _DEBUG_BODY_LIMIT = 64 * 1024;

async function _debugMessageBody(message: Request | Response): Promise<string> {
	if (message.bodyUsed) return "[body used]";
	const body = message.clone().body;
	if (!body) return "";
	const reader = body.getReader();
	const decoder = new TextDecoder();
	let bytes = 0;
	let text = "";
	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) return text + decoder.decode();
			bytes += value.byteLength;
			if (bytes > _DEBUG_BODY_LIMIT) {
				const keep = value.byteLength - (bytes - _DEBUG_BODY_LIMIT);
				text += decoder.decode(value.subarray(0, keep), { stream: true });
				await reader.cancel();
				return `${text}${decoder.decode()}\n[truncated at ${_DEBUG_BODY_LIMIT} bytes]`;
			}
			text += decoder.decode(value, { stream: true });
		}
	} catch (reason) {
		return `${text}\n[read failed: ${(reason as Error)?.message ?? reason}]`;
	}
}

/** Debug a `Request` as a string. */
export function debugRequest(request: Request): string {
	return `${request.method} ${request.url}`;
}

/** Debug a `Response` as a string. */
export function debugResponse(response: Response): string {
	return `${response.status} ${response.statusText}`;
}

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

/** If a string is multiline, push it onto the next line and prepend a tab to each line.. */
export function indent(str: string): string {
	const lines = str.split("\n");
	return lines.length > 1 ? `\n${lines.join("\n\t")}` : ` ${str}`;
}
