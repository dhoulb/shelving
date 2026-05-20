import { isArray } from "../../util/array.js";
import { getDictionaryItems, type ImmutableDictionary, isDictionary } from "../../util/dictionary.js";

/**
 * Set of classnames that can be joined.
 *
 * - `string` — used directly as a classname.
 * - `null` or `undefined` — ignored.
 * - Array of classnames — recursively parsed.
 */
export type Classes = string | null | undefined | readonly Classes[] | Variants;

/**
 * Variants list is a dictionary of booleans.
 * - `true` or `false` item values in dictionaries use the string `key` of the item if the value is `true`, or ignore it if the value is falsy.
 * - Anything that is not `true` has no effect, so other values can be passed in and will be ignored. This means you can pass the entire `props` into this and it'll work just fine.
 *
 * Typed as `object` (not `Data`/`Record<string, unknown>`) so plain `interface` types are accepted —
 * interfaces lack an implicit string index signature, so they don't satisfy index-signature types.
 */
export interface Variants {
	readonly [key: string]: boolean;
}

/** CSS modules mapping of local class names to hashed runtime class names. */
export type CSSModule = ImmutableDictionary<string | undefined>;

/**
 * Parse a list of possible `className` strings and join them into a single string.
 * - See `Classes` type for parsing rules.
 *
 * @param classes The input set of classes to merge.
 * @returns The merged string classname.
 */
export function getClass(...classes: unknown[]): string {
	return Array.from(getClasses(classes)).join(" ");
}

/** Yield the items in a list of possible `className` strings. */
function* getClasses(classes: unknown): Iterable<string> {
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
		// If `v` is `true`, return the keyname as a classname.
		// Anything else is ignored or not processed.
		for (const [k, v] of getDictionaryItems(classes)) if (v === true) yield k;
	}
}

/**
 * Parse a list of possible `className` strings, match them in a `CSSModule` dictionary, and join them into a single string.
 * - See `Classes` type for parsing rules.
 *
 * @param module CSS module object _or_ a string.
 * - Allows "string" because if this environment does not process `*.module.css` files then `import styles from "./styles.module.css"` will be a string.
 * - This allows this situation to be handled gracefully and classes will be silently ignored in this environment.
 *
 * @param classes Class keys/values to merge.
 * @returns The merged string classname.
 */
export function getModuleClass(module: CSSModule | string, ...classes: unknown[]): string | undefined {
	if (isDictionary(module)) return Array.from(getModuleClasses(module, classes)).join(" ");
}

/** Yield the items in a list of possible `className` strings that match a `CSSModule` dictionary. */
function* getModuleClasses(module: CSSModule, classes: unknown): Iterable<string> {
	for (const x of getClasses(classes)) {
		const y = module[x];
		if (y) yield y;
	}
}
