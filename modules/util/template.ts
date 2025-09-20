import { RequiredError } from "../error/RequiredError.js";
import { ValueError } from "../error/ValueError.js";
import type { ImmutableArray } from "./array.js";
import { EMPTY_DICTIONARY, type ImmutableDictionary } from "./dictionary.js";
import type { AnyCaller } from "./function.js";
import { setMapItem } from "./map.js";
import { type Mutable, isObject } from "./object.js";
import type { NotString } from "./string.js";

/** Single template chunk. */
type TemplateChunk = {
	readonly pre: string;
	readonly name: string;
	readonly placeholder: string;
	readonly post: string;
};

/** Set of template chunks. */
type TemplateChunks = ImmutableArray<TemplateChunk>;

/** Template values can be numbers or strings. */
export type TemplateValue = string | number;

/** Dictionary of named template values in `{ myPlaceholder: "value" }` format. */
export type TemplateDictionary = ImmutableDictionary<TemplateValue>;

/** Ordered list of unnamed template values. */
export type TemplateArray = ImmutableArray<TemplateValue>;

/** Callback that returns the right replacement string for a given placeholder. */
export type TemplateCallback = (placeholder: string) => string;

/**
 * Things that can be converted to the value for a named placeholder.
 *
 * `string` — Single string used for every `{placeholder}`
 * `ImmutableArray<string>` — Array of strings (or functions that return strings) used for `*` numbered placeholders e.g. `["John"]`
 * `TemplateValues` — Object containing named strings used for named placeholders, e.g. `{ myPlaceholder: "Ellie" }`
 * `TemplateCallback` — Function that returns the right string for a named `{placeholder}`.v
 */
export type TemplateValues = TemplateValue | TemplateArray | TemplateDictionary | TemplateCallback;

// RegExp to find named variables in several formats e.g. `:a`, `${b}`, `{{c}}` or `{d}`
const R_PLACEHOLDERS = /(\*|:[a-z][a-z0-9]*|\$\{[a-z][a-z0-9]*\}|\{\{[a-z][a-z0-9]*\}\}|\{[a-z][a-z0-9]*\})/i;

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
		const name = placeholder === "*" ? String(asterisks++) : R_NAME.exec(placeholder)?.[0] || "";
		chunks.push({ pre, placeholder, name, post });
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
 */
export function getPlaceholders(template: string): readonly string[] {
	return _splitTemplateCached(template, getPlaceholders).map(_getPlaceholder);
}
function _getPlaceholder({ name }: TemplateChunk): string {
	return name;
}

/**
 * Match a template against a target string.
 * - Turn ":year-:month" and "2016-06..." etc into `{ year: "2016"... }`
 *
 * @param templates Either a single template string, or an iterator that returns multiple template template strings.
 * - Template strings can include placeholders (e.g. `:name-${country}/{city}`).
 * @param target The string containing values, e.g. `Dave-UK/Manchester`
 *
 * @return An object containing values, e.g. `{ name: "Dave", country: "UK", city: "Manchester" }`, or undefined if target didn't match the template.
 */
export function matchTemplate(template: string, target: string, caller: AnyCaller = matchTemplate): TemplateDictionary | undefined {
	// Get separators and placeholders from template.
	const chunks = _splitTemplateCached(template, caller);
	const firstChunk = chunks[0];

	// Return early if empty.
	if (!firstChunk) return template === target ? EMPTY_DICTIONARY : undefined;

	// Check first separator.
	if (!target.startsWith(firstChunk.pre)) return undefined; // target doesn't match template

	// Loop through the placeholders (placeholders are at all the even-numbered positions in `chunks`).
	let startIndex = firstChunk.pre.length;
	const values: Mutable<TemplateDictionary> = {};
	for (const { name, post } of chunks) {
		const stopIndex = !post ? Number.POSITIVE_INFINITY : target.indexOf(post, startIndex);
		if (stopIndex < 0) return undefined; // Target doesn't match template because chunk post wasn't found.
		const value = target.slice(startIndex, stopIndex);
		if (!value.length) return undefined; // Target doesn't match template because chunk value was missing.
		values[name] = value;
		startIndex = stopIndex + post.length;
	}
	if (startIndex < target.length) return undefined; // Target doesn't match template because last chunk post didn't reach the end.
	return values;
}

/**
 * Match multiple templates against a target string and return the first match.
 */
export function matchTemplates(templates: Iterable<string> & NotString, target: string): TemplateDictionary | undefined {
	for (const template of templates) {
		const values = matchTemplate(template, target);
		if (values) return values;
	}
}

/**
 * Turn ":year-:month" and `{ year: "2016"... }` etc into "2016-06..." etc.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @param values An object containing values, e.g. `{ name: "Dave", country: "UK", city: "Manchester" }` (functions are called, everything else converted to string), or a function or string to use for all placeholders.
 * @return The rendered string, e.g. `Dave-UK/Manchester`
 *
 * @throws {RequiredError} If a placeholder in the template string is not specified in values.
 */
export function renderTemplate(template: string, values: TemplateValues, caller: AnyCaller = renderTemplate): string {
	const chunks = _splitTemplateCached(template, caller);
	if (!chunks.length) return template;
	let output = template;
	for (const { name, placeholder } of chunks) output = output.replace(placeholder, _replaceTemplateKey(name, values, caller));
	return output;
}
function _replaceTemplateKey(key: string, values: TemplateValues, caller: AnyCaller): string {
	if (typeof values === "string") return values;
	if (typeof values === "number") return values.toString();
	if (typeof values === "function") return values(key);
	if (isObject(values)) {
		const v = values[key];
		if (typeof v === "string") return v;
		if (typeof v === "number") return v.toString();
	}
	throw new RequiredError(`Template key "${key}" must be defined`, { received: values, key, caller });
}
