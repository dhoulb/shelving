import { mergeElements } from "../util/element.js";
import type { TreeElement } from "../util/tree.js";

/**
 * Base class for an extractor that converts an input of type `I` into a `TreeElement` output.
 * - Extractors are composable: outer extractors delegate to inner extractors.
 * - The output type is always a `TreeElement` (or a more specific subtype).
 *
 * @example
 * class JSONExtractor extends Extractor<string, TreeElement> {
 * 	extract(input: string): TreeElement { return JSON.parse(input); }
 * }
 * @see https://dhoulb.github.io/shelving/extract/Extractor/Extractor
 */
export abstract class Extractor<I, O extends TreeElement = TreeElement> {
	/**
	 * Extract a tree element from the given input.
	 *
	 * @param input The input value to extract from.
	 * @returns The extracted `TreeElement`, or a promise resolving to one.
	 * @example await myExtractor.extract(input)
	 * @see https://dhoulb.github.io/shelving/extract/Extractor/Extractor/extract
	 */
	abstract extract(input: I): O | Promise<O>;
}

/**
 * Merge two tree elements — `primary` keeps its identity (`type`, `key`, `source`); `secondary` contributes any
 * metadata `primary` does not already have.
 * - `title` and `description` are taken from `primary` when set, otherwise from `secondary` — primary stays canonical
 *   but a missing field falls back rather than disappearing.
 * - `content` and `children` from both are concatenated (primary first).
 *
 * @param primary The element whose identity is preserved and whose set fields win.
 * @param secondary The element whose metadata fills any gaps in `primary`.
 * @returns A new `TreeElement` with `primary`'s identity and the merged metadata of both.
 * @example mergeTreeElements(tsElement, mdElement) // ts identity + md prose
 * @see https://dhoulb.github.io/shelving/extract/Extractor/mergeTreeElements
 */
export function mergeTreeElements<T extends TreeElement>(primary: T, secondary: TreeElement): T;
export function mergeTreeElements(primary: TreeElement, secondary: TreeElement): TreeElement {
	return {
		...primary,
		type: primary.type,
		key: primary.key,
		props: {
			...primary.props,
			title: primary.props.title ?? secondary.props.title,
			description: primary.props.description ?? secondary.props.description,
			content: _mergeContent(primary.props.content, secondary.props.content),
			children: mergeElements(primary.props.children, secondary.props.children),
		},
	};
}

/** Merge two markup content strings — primary first, secondary appended after a blank line. Returns `undefined` if both are empty. */
function _mergeContent(a: string | undefined, b: string | undefined): string | undefined {
	if (!a) return b;
	if (!b) return a;
	return `${a}\n\n${b}`;
}
