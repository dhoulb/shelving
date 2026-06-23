import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import { type ImmutableArray, isArray } from "./array.js";
import { getDataProp, isData } from "./data.js";
import { EMPTY_DICTIONARY, type ImmutableDictionary } from "./dictionary.js";
import { type AnyCaller, isFunction } from "./function.js";
import { setMapItem } from "./map.js";
import type { Mutable } from "./object.js";
import type { AbsolutePath } from "./path.js";
import { getString, type NotString, type PossibleString } from "./string.js";

/** Single template chunk. */
type TemplateChunk = {
	readonly pre: string;
	readonly name: string;
	readonly placeholder: string;
	readonly post: string;
	/** True if this placeholder is a catchall (`**`, `...prefix`, or `*suffix`) — allows empty values and (in path mode) spans separators. */
	readonly catchall: boolean;
};

/** Set of template chunks. */
type TemplateChunks = ImmutableArray<TemplateChunk>;

/**
 * Things that can be converted to the value for a named placeholder.
 *
 * `PossibleString` — Single string used for every `{placeholder}`
 * `ImmutableArray<string>` — Array of strings (or functions that return strings) used for `*` numbered placeholders e.g. `["John"]`
 * `ImmutableDictionary<PossibleString>` — Object containing named strings used for named placeholders, e.g. `{ val1: "Ellie", val2: 123 }`
 * `(placeholder: string) => string` — Function that returns the right string for a named `{placeholder}`.
 *
 * @see https://shelving.cc/util/template/TemplateValues
 */
export type TemplateValues = PossibleString | ImmutableArray<unknown> | ImmutableDictionary<unknown> | ((placeholder: string) => string);

/**
 * The output of matching a template is a dictionary in `{ myPlaceholder: "value" }` format.
 *
 * @see https://shelving.cc/util/template/TemplateMatches
 */
export type TemplateMatches = ImmutableDictionary<string>;

/**
 * List of `{placeholders}` found in a template string.
 *
 * @see https://shelving.cc/util/template/TemplatePlaceholders
 */
export type TemplatePlaceholders = ImmutableArray<string>;

/**
 * RegExp to find named placeholders in several formats, each with optional catchall modifiers (`...prefix` or `*suffix` — three-or-more dots, one-or-more stars):
 * - Anonymous: `*` (single segment), `**` / `***` / etc. (catchall).
 * - Colon: `:name`, `:name*`, `:name**` (catchall).
 * - Dollar-brace: `${name}`, `${...name}`, `${name*}`, `${....name}`, `${name**}`.
 * - Double-brace: `{{name}}`, `{{...name}}`, `{{name*}}`.
 * - Single-brace: `{name}`, `{...name}`, `{name*}`.
 * - Square-bracket: `[name]`, `[...name]`, `[name*]`.
 */
const R_PLACEHOLDERS =
	/(\*+|:[a-z][a-z0-9]*\**|\$\{(?:\.{3,})?[a-z][a-z0-9]*\**\}|\{\{(?:\.{3,})?[a-z][a-z0-9]*\**\}\}|\{(?:\.{3,})?[a-z][a-z0-9]*\**\}|\[(?:\.{3,})?[a-z][a-z0-9]*\**\])/i;

// Find actual name within template placeholder e.g. `${name}` → `name`
const R_NAME = /[a-z0-9]+/i;

/**
 * Split up a template into an array of separator → placeholder → separator → placeholder → separator
 * - Odd numbered chunks are separators.
 * - Even numbered chunks are placeholders.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @returns Array of strings alternating separator and placeholder.
 */
function _splitTemplate(template: string, caller: AnyCaller): TemplateChunks {
	const matches = template.split(R_PLACEHOLDERS);
	let asterisks = 0;
	const chunks: TemplateChunk[] = [];
	for (let i = 1; i < matches.length; i += 2) {
		const pre = matches[i - 1] as string;
		const placeholder = matches[i] as string;
		const post = matches[i + 1] as string;
		if (i > 1 && !pre.length)
			throw new ValueError("Template placeholders must be separated by at least one character", { received: template, caller });
		let name: string;
		let catchall: boolean;
		if (placeholder[0] === "*") {
			// Anonymous: `*` is a single segment, `**` (or more stars) is a catchall.
			name = String(asterisks++);
			catchall = placeholder.length > 1;
		} else {
			name = R_NAME.exec(placeholder)?.[0] || "";
			catchall = placeholder.includes("...") || placeholder.includes("*");
		}
		chunks.push({ pre, placeholder, name, post, catchall });
	}
	return chunks;
}
const TEMPLATE_CACHE = new Map<string, TemplateChunks>();
function _splitTemplateCached(template: string, caller: AnyCaller): TemplateChunks {
	return TEMPLATE_CACHE.get(template) || setMapItem(TEMPLATE_CACHE, template, _splitTemplate(template, caller));
}

/**
 * Get list of placeholders named in a template string.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @returns Array of clean string names of found placeholders, e.g. `["name", "country", "city"]`
 * @example getPlaceholders(":name-${country}/{city}") // ["name", "country", "city"]
 * @see https://shelving.cc/util/template/getPlaceholders
 */
export function getPlaceholders(template: string): TemplatePlaceholders {
	return _splitTemplateCached(template, getPlaceholders).map(_getPlaceholder);
}
function _getPlaceholder({ name }: TemplateChunk): string {
	return name;
}

/**
 * Match a template against a target string with no separator semantics.
 * - Turn `:year-:month` and `2016-06`... etc into `{ year: "2016"... }`.
 * - Non-catchall placeholders match non-empty values; catchall placeholders (`**`, `:name*`, `{...name}`, etc.) allow empty values.
 *
 * @param template The template string, e.g. `:name-${country}/{city}`.
 * @param target The string containing values, e.g. `Dave-UK/Manchester`.
 * @param caller Function to attribute a thrown error to (defaults to `matchTemplate` itself).
 * @returns An object containing values (e.g. `{ name: "Dave", country: "UK", city: "Manchester" }`), or `undefined` if no match.
 * @throws {ValueError} If two template placeholders are not separated by at least one character.
 * @example matchTemplate(":name-${country}/{city}", "Dave-UK/Manchester") // { name: "Dave", country: "UK", city: "Manchester" }
 * @see https://shelving.cc/util/template/matchTemplate
 */
export function matchTemplate(template: string, target: string, caller: AnyCaller = matchTemplate): TemplateMatches | undefined {
	return _matchTemplate(template, target, "", caller);
}

/**
 * Match a path-shaped template against a target path.
 * - Like `matchTemplate()`, but with `/` segment semantics: non-catchall placeholders cannot span path segments; catchall placeholders can.
 * - A trailing catchall (e.g. `/files/{...path}`) also matches when the trailing separator is absent (e.g. `/files`), with the catchall value as `""`.
 *
 * @param template The path-shaped template string, e.g. `/users/{name}`.
 * @param target The path containing values, e.g. `/users/Dave`.
 * @param caller Function to attribute a thrown error to (defaults to `matchPathTemplate` itself).
 * @returns An object containing values (e.g. `{ name: "Dave" }`), or `undefined` if no match.
 * @throws {ValueError} If two template placeholders are not separated by at least one character.
 * @example matchPathTemplate("/users/{name}", "/users/Dave") // { name: "Dave" }
 * @see https://shelving.cc/util/template/matchPathTemplate
 */
export function matchPathTemplate(
	template: AbsolutePath,
	target: AbsolutePath,
	caller: AnyCaller = matchPathTemplate,
): TemplateMatches | undefined {
	return _matchTemplate(template, target, "/", caller);
}

function _matchTemplate(template: string, target: string, separator: string, caller: AnyCaller): TemplateMatches | undefined {
	// Get separators and placeholders from template.
	const chunks = _splitTemplateCached(template, caller);
	const firstChunk = chunks[0];

	// Return early if empty.
	if (!firstChunk) return template === target ? EMPTY_DICTIONARY : undefined;

	// Special case: single trailing catchall whose `pre` ends with the separator (e.g. `/files/{...path}`) — also match the variant without the trailing separator (`/files`).
	if (
		separator &&
		chunks.length === 1 &&
		firstChunk.catchall &&
		!firstChunk.post &&
		firstChunk.pre.endsWith(separator) &&
		target === firstChunk.pre.slice(0, -separator.length)
	) {
		return { [firstChunk.name]: "" };
	}

	// Check first separator.
	if (!target.startsWith(firstChunk.pre)) return undefined; // target doesn't match template

	// Loop through the placeholders (placeholders are at all the even-numbered positions in `chunks`).
	let startIndex = firstChunk.pre.length;
	const values: Mutable<TemplateMatches> = {};
	for (const { name, post, catchall } of chunks) {
		const stopIndex = !post ? Number.POSITIVE_INFINITY : target.indexOf(post, startIndex);
		if (stopIndex < 0) return undefined; // Target doesn't match template because chunk post wasn't found.
		const value = target.slice(startIndex, stopIndex);
		if (!catchall) {
			if (!value.length) return undefined; // Empty values only allowed for catchall placeholders.
			if (separator && value.includes(separator)) return undefined; // Non-catchall placeholders can't span separators (when one is configured).
		}
		values[name] = value;
		startIndex = stopIndex + post.length;
	}
	if (startIndex < target.length) return undefined; // Target doesn't match template because last chunk post didn't reach the end.
	return values;
}

/**
 * Match multiple templates against a target string and return the first match (no separator semantics).
 *
 * @param templates Iterable of template strings to try in order, e.g. `[":name-:age", ":name"]`.
 * @param target The string containing values, e.g. `Dave-40`.
 * @returns An object of values for the first matching template, or `undefined` if none match.
 * @example matchTemplates([":name-:age", ":name"], "Dave-40") // { name: "Dave", age: "40" }
 * @see https://shelving.cc/util/template/matchTemplates
 */
export function matchTemplates(templates: Iterable<string> & NotString, target: string): TemplateMatches | undefined {
	for (const template of templates) {
		const values = matchTemplate(template, target);
		if (values) return values;
	}
}

/**
 * Match multiple path-shaped templates against a target path and return the first match.
 *
 * @param templates Iterable of path-shaped template strings to try in order, e.g. `["/users/{name}", "/users"]`.
 * @param target The path containing values, e.g. `/users/Dave`.
 * @returns An object of values for the first matching template, or `undefined` if none match.
 * @example matchPathTemplates(["/users/{name}", "/users"], "/users/Dave") // { name: "Dave" }
 * @see https://shelving.cc/util/template/matchPathTemplates
 */
export function matchPathTemplates(templates: Iterable<AbsolutePath> & NotString, target: AbsolutePath): TemplateMatches | undefined {
	for (const template of templates) {
		const values = matchPathTemplate(template, target);
		if (values) return values;
	}
}

/**
 * Turn ":year-:month" and `{ year: "2016"... }` etc into "2016-06..." etc.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @param values An object containing values, e.g. `{ name: "Dave", country: "UK", city: "Manchester" }` (functions are called, everything else converted to string), or a function or string to use for all placeholders.
 * @param caller Function to attribute a thrown error to (defaults to `renderTemplate` itself).
 * @returns The rendered string, e.g. `Dave-UK/Manchester`
 * @throws {RequiredError} If a placeholder in the template string is not specified in values.
 * @example renderTemplate(":name-${country}/{city}", { name: "Dave", country: "UK", city: "Manchester" }) // "Dave-UK/Manchester"
 * @see https://shelving.cc/util/template/renderTemplate
 */
export function renderTemplate(template: string, values: TemplateValues, caller: AnyCaller = renderTemplate): string {
	const chunks = _splitTemplateCached(template, caller);
	if (!chunks.length) return template;
	let output = template;
	if (isFunction(values)) {
		for (const { name, placeholder } of chunks) output = output.replace(placeholder, values(name));
	} else if (isData(values)) {
		for (const { name, placeholder } of chunks) {
			const v = getString(getDataProp(values, name));
			if (v === undefined)
				throw new RequiredError(`Template placeholder "${name}" not found in object`, { received: values, name, caller });
			output = output.replace(placeholder, v);
		}
	} else if (isArray(values)) {
		for (const { name, placeholder } of chunks) {
			const v = getString(values[Number(name)]);
			if (v === undefined) throw new RequiredError(`Template placeholder "${name}" not found in array`, { received: values, name, caller });
			output = output.replace(placeholder, v);
		}
	} else {
		const v = getString(values);
		if (v === undefined) throw new RequiredError(`Template value must be string`, { received: values, caller });
		for (const { placeholder } of chunks) output = output.replace(placeholder, v);
	}
	return output;
}

/**
 * Render a path-shaped template. Behaviourally identical to `renderTemplate()` — substitution doesn't need separator awareness — but provided as a sibling to `matchPathTemplate()` so callers can pair them.
 *
 * @param template The path-shaped template including placeholders, e.g. `/users/{name}`.
 * @param values An object containing values (functions are called, everything else converted to string), or a function or string to use for all placeholders.
 * @param caller Function to attribute a thrown error to (defaults to `renderPathTemplate` itself).
 * @returns The rendered path, e.g. `/users/Dave`.
 * @throws {RequiredError} If a placeholder in the template string is not specified in values.
 * @example renderPathTemplate("/users/{name}", { name: "Dave" }) // "/users/Dave"
 * @see https://shelving.cc/util/template/renderPathTemplate
 */
export function renderPathTemplate(template: AbsolutePath, values: TemplateValues, caller: AnyCaller = renderPathTemplate): AbsolutePath {
	return renderTemplate(template, values, caller) as AbsolutePath;
}
