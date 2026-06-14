import { mergeElements, walkElements } from "../util/element.js";
import { notNullish } from "../util/null.js";
import { anyMatch, type Matchables } from "../util/regexp.js";
import type { TreeElement } from "../util/tree.js";
import type { Extractor } from "./Extractor.js";
import { ThroughExtractor } from "./ThroughExtractor.js";

/**
 * Default index file patterns.
 * - Matched case-insensitively (all entries stored lowercase).
 * - The first child that matches any pattern is absorbed.
 */
const DEFAULT_INDEX: Matchables = [/^readme\.txt$/i, /^readme\.md$/i, /^index\.md$/i, /^index\.ts$/i, /^index\.tsx$/i];

/** Options for an `IndexExtractor`. */
export interface IndexExtractorOptions {
	/**
	 * Filename patterns treated as a parent's index. Matched case-insensitively against each child element's `key`.
	 * - Defaults to README and index files: `["readme.txt", "readme.md", "index.md", "index.ts", "index.tsx"]`.
	 */
	readonly index?: Matchables;
}

/**
 * Through extractor that absorbs each element's index child into the element itself.
 * - For every element with children: finds the first child whose `key` matches any `index` pattern.
 * - The matched child's `title`, `description`, `content`, and `children` are folded into the parent.
 * - The matched child is removed from the parent's children list.
 * - Purely name-based: it doesn't care whether an element is a directory or a file — any element with children is processed, deepest level first.
 */
export class IndexExtractor<I> extends ThroughExtractor<I, TreeElement> {
	private readonly _index: Matchables;

	constructor(source: Extractor<I, TreeElement>, { index = DEFAULT_INDEX }: IndexExtractorOptions = {}) {
		super(source);
		this._index = index;
	}

	override async extract(input: I): Promise<TreeElement> {
		const root = await this.source.extract(input);
		return _absorbIndex(root, this._index);
	}
}

/** Recursively absorb the index child in `element` and all of its descendants that have children. */
function _absorbIndex(element: TreeElement, index: Matchables): TreeElement {
	// Recurse first so nested levels absorb their own indexes before we look at this one.
	// Only descend into elements that actually have children — leaving childless leaves (e.g. files) untouched, including their `undefined` children.
	const recursed = Array.from(walkElements(element.props.children)).map(child =>
		notNullish(child.props.children) ? _absorbIndex(child, index) : child,
	) as TreeElement[];

	// Find the index child by key.
	const indexChild = recursed.find(child => anyMatch(child.key, ...index));
	if (!indexChild) return { ...element, props: { ...element.props, children: recursed } };

	// Fold the index child into the parent, and drop it from children.
	const remaining = recursed.filter(child => child !== indexChild);
	return {
		...element,
		props: {
			...element.props,
			title: element.props.title ?? indexChild.props.title,
			description: element.props.description ?? indexChild.props.description,
			content: element.props.content ?? indexChild.props.content,
			children: mergeElements(indexChild.props.children, remaining),
		},
	};
}
