import type { ImmutableArray } from "./array";
import { initialise, Lazy } from "./function";
import { MutableObject, isObject, ImmutableObject } from "./object";

type Chunk = { pre: string; name: string; placeholder: string; post: string };
type Chunks = ImmutableArray<Chunk>;

/** Template values in `{ placeholder: value }` format. */
export type TemplateValues = ImmutableObject<string>;

/** Things that can be converted to the value for a named placeholder. */
type PlaceholderValues =
	| string // Single string used for every placeholder.
	| ((name: string) => string) // Function that returns the right string for a named placeholder.
	| string[] // Array of strings (or functions that return strings) used for `*` numbered placeholders e.g. `["Dave"]`
	| TemplateValues; // Object containing named strings used for `{named}` placeholders, e.g. `{ name: "Dave" }`

// RegExp to find named variables in several formats e.g. `:a`, `${b}`, `{{c}}` or `{d}`
const R_PLACEHOLDERS = /(\*|:[a-z][a-z0-9]*|\$\{[a-z][a-z0-9]*\}|\{\{[a-z][a-z0-9]*\}\}|\{[a-z][a-z0-9]*\})/i;

// Find actual name within template placeholder e.g. `${name}` → `name`
const R_NAME = /[a-z0-9]+/i;

// Empty template.
const EMPTY_TEMPLATE = Object.create(null);

// Cache of templates.
const cache: MutableObject<Chunks> = Object.create(null);

/**
 * Split up a template into an array of separator → placeholder → separator → placeholder → separator
 * - Odd numbered chunks are separators.
 * - Even numbered chunks are placeholders.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @returns Array of strings alternating separator and placeholder.
 */
const splitTemplate = (template: string): Chunks => (cache[template] ||= _splitTemplate(template));
const _splitTemplate = (template: string): Chunks => {
	const matches = template.split(R_PLACEHOLDERS);
	let asterisks = 0;
	const chunks: Chunk[] = [];
	for (let i = 1; i < matches.length; i += 2) {
		const pre = matches[i - 1] as string;
		const placeholder = matches[i] as string;
		const post = matches[i + 1] as string;
		if (i > 1 && !pre.length) throw new SyntaxError("shelving/template: Placeholders must be separated by at least one character");
		const name = placeholder === "*" ? String(asterisks++) : R_NAME.exec(placeholder)?.[0] || "";
		chunks.push({ pre, placeholder, name, post });
	}
	return chunks;
};

/**
 * Get list of placeholders named in a template string.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @returns Array of clean string names of found placeholders, e.g. `["name", "country", "city"]`
 */
export const getPlaceholders = (template: string): readonly string[] => splitTemplate(template).map(getTemplateName);
const getTemplateName = (chunk: Chunk) => chunk.name;

/**
 * Turn ":year-:month" and "2016-06..." etc into `{ year: "2016"... }`
 *
 * @param lazyTemplates Either a single template string, or an arr../function of template strings.
 * - Template strings can include placeholders (e.g. `:name-${country}/{city}`).
 * @param target The string containing values, e.g. `Dave-UK/Manchester`
 * @return An object containing values, e.g. `{ name: "Dave", country: "UK", city: "Manchester" }`, or undefined if target didn't match the template.
 */
export const matchTemplate = (
	lazyTemplates: Lazy<string | string[] | Iterable<string> | Generator<string>, [string]>,
	target: string,
): TemplateValues | undefined => {
	const templates = initialise(lazyTemplates, target);
	if (typeof templates === "string") {
		const values = matchInternal(templates, target);
		if (values) return values;
	} else {
		for (const template of templates) {
			const values = matchInternal(template, target);
			if (values) return values;
		}
	}
	return undefined;
};

// Internal match function (called several times).
const matchInternal = (template: string, target: string): TemplateValues | undefined => {
	// Get separators and placeholders from template.
	const chunks = splitTemplate(template);
	const firstChunk = chunks[0];

	// Return early if empty.
	if (!firstChunk) return template === target ? EMPTY_TEMPLATE : undefined;

	// Check first separator.
	if (!target.startsWith(firstChunk.pre)) return undefined; // target doesn't match template

	// Loop through the placeholders (placeholders are at all the even-numbered positions in `chunks`).
	let startIndex = firstChunk.pre.length;
	const values = Object.create(null);
	for (const { name, post } of chunks) {
		const stopIndex = !post ? Infinity : target.indexOf(post, startIndex);
		if (stopIndex < 0) return undefined; // Target doesn't match template because chunk post wasn't found.
		const value = target.substring(startIndex, stopIndex);
		if (!value.length) return undefined; // Target doesn't match template because chunk value was missing.
		values[name] = value;
		startIndex = stopIndex + post.length;
	}
	if (startIndex < target.length) return undefined; // Target doesn't match template because last chunk post didn't reach the end.
	return values;
};

/**
 * Turn ":year-:month" and `{ year: "2016"... }` etc into "2016-06..." etc.
 *
 * @param template The template including template placeholders, e.g. `:name-${country}/{city}`
 * @param values An object containing values, e.g. `{ name: "Dave", country: "UK", city: "Manchester" }` (functions are called, everything else converted to string), or a function or string to use for all placeholders.
 * @return The rendered string, e.g. `Dave-UK/Manchester`
 *
 * @throws {ReferenceError} If a placeholder in the template string is not specified in values.
 */
export const renderTemplate = (template: string, value: PlaceholderValues): string => {
	const chunks = splitTemplate(template);
	if (!chunks.length) return template;
	let output = template;
	for (const { name, placeholder } of chunks) output = output.replace(placeholder, getValue(name, value));
	return output;
};
const getValue = (name: string, value: PlaceholderValues): string => {
	if (typeof value === "string") return value;
	if (typeof value === "function") return value(name);
	if (isObject(value)) {
		const v = value[name];
		if (typeof v === "string") return v;
	}
	throw new ReferenceError(`shelving/template: values.${name}: Must be defined`);
};
