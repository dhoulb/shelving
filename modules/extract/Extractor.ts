import { mergeElements } from "../util/element.js";
import type { TreeElement } from "../util/tree.js";

/**
 * Base class for an extractor that converts input into a tree element.
 * - Extractors are composable: outer extractors delegate to inner extractors.
 * - The output type is always a `TreeElement` (or a more specific subtype).
 */
export abstract class Extractor<I, O extends TreeElement = TreeElement> {
	/** Extract a tree element from the given input. */
	abstract extract(input: I): O | Promise<O>;
}

/**
 * Merge two tree elements — `primary` keeps its identity (`type`, `key`, `source`); `secondary` contributes any
 * metadata `primary` does not already have.
 * - `title` and `description` are taken from `primary` when set, otherwise from `secondary` — primary stays canonical
 *   but a missing field falls back rather than disappearing.
 * - `content` and `children` from both are concatenated (primary first).
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
