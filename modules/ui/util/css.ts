import { type ImmutableArray, isArray } from "../../util/array.js";
import { getDictionaryItems, type ImmutableDictionary, isDictionary } from "../../util/dictionary.js";

/**
 * Set of classnames that can be joined.
 *
 * - `string` — used directly as a classname.
 * - `null` or `undefined` — ignored.
 * - Array of classnames — recursively parsed.
 * - Dictionary of classnames — recursively parsed.
 *     - `true` or `false` item values in dictionaries use the string `key` of the item if the value is `true`, or ignore it if the value is `false`
 */
export type Classes = string | null | undefined | ClassesArray | ClassesDictionary;
export interface ClassesArray extends ImmutableArray<Classes> {}
export interface ClassesDictionary extends ImmutableDictionary<Classes | boolean> {}

/** CSS modules mapping of local class names to hashed runtime class names. */
export type CSSModule = ImmutableDictionary<string | undefined>;

/**
 * Parse a list of possible `className` strings and join them into a single string.
 * - See `Classes` type for parsing rules.
 *
 * @param classes The input set of classes to merge.
 * @returns The merged string classname.
 */
export function getClass(...classes: Classes[]): string {
	return Array.from(getClasses(classes)).join(" ");
}

/** Yield the items in a list of possible `className` strings. */
function* getClasses(classes: Classes): Iterable<string> {
	if (!classes) return;

	if (typeof classes === "string") {
		yield classes;
		return;
	}

	if (isArray(classes)) {
		// Recurse.
		for (const value of classes) yield* getClasses(value);
		return;
	}

	if (isDictionary(classes)) {
		for (const [k, v] of getDictionaryItems(classes as ClassesDictionary)) {
			if (!v) continue;
			if (v === true) {
				yield k;
			} else if (typeof v === "string") {
				yield v;
			} else {
				yield* getClasses(v);
			}
		}
	}
}

/**
 * Parse a list of possible `className` strings, match them in a `CSSModule` dictionary, and join them into a single string.
 * - See `Classes` type for parsing rules.
 *
 * @param module CSS module styles object.
 * @param classes Class keys/values to merge.
 * @returns The merged string classname.
 *
 * @throws {RequiredError} if the specified `className` does not exist in the CSS module.
 */
export function getModuleClass(module: CSSModule, ...classes: Classes[]): string {
	return Array.from(getModuleClasses(module, classes)).join(" ");
}

/** Yield the items in a list of possible `className` strings that match a `CSSModule` dictionary. */
function* getModuleClasses(module: CSSModule, classes: Classes[]): Iterable<string> {
	for (const x of getClasses(classes)) {
		const y = module[x];
		if (y) yield y;
	}
}
