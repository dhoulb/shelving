import { mergeElements, walkElements } from "../util/element.js";
import { anyMatch, type Matchables } from "../util/regexp.js";
import type { TreeElement } from "../util/tree.js";
import type { Extractor } from "./Extractor.js";
import { ThroughExtractor } from "./ThroughExtractor.js";

/**
 * Default index file patterns.
 * - Matched case-insensitively (all entries stored lowercase).
 * - The first child of a directory that matches any pattern is absorbed.
 */
const DEFAULT_INDEX: Matchables = [/^readme\.txt$/i, /^readme\.md$/i, /^index\.md$/i, /^index\.ts$/i, /^index\.tsx$/i];

/** Options for an `IndexFileExtractor`. */
export interface IndexFileExtractorOptions {
	/**
	 * Filename patterns treated as the directory's index file. Matched case-insensitively against each child element's `key`.
	 * - Defaults to README and index files: `["readme.txt", "readme.md", "index.md", "index.ts", "index.tsx"]`.
	 */
	readonly index?: Matchables;
}

/**
 * Through extractor that walks a tree of `tree-element` nodes and absorbs each directory's index file into the directory itself.
 * - For each directory: finds the first child whose `key` matches any `index` pattern.
 * - The matched child's `title`, `description`, `content`, and `children` are folded into the parent directory.
 * - The matched child is removed from the parent's children list.
 * - Recurses into subdirectories before absorbing — the deepest level happens first.
 */
export class IndexFileExtractor<I> extends ThroughExtractor<I, TreeElement> {
	private readonly _index: Matchables;

	constructor(source: Extractor<I, TreeElement>, { index = DEFAULT_INDEX }: IndexFileExtractorOptions = {}) {
		super(source);
		this._index = index;
	}

	override async extract(input: I): Promise<TreeElement> {
		const root = await this.source.extract(input);
		return _absorbIndex(root, this._index);
	}
}

/** Recursively absorb the index file in `dir` and all nested directories. */
function _absorbIndex(dir: TreeElement, index: Matchables): TreeElement {
	// Recurse first so nested directories absorb their own indexes before we look at this level.
	// Only descend into directories (whose `key` equals their `name`); files carry a `.ext` suffix and have no index to absorb.
	const recursed = Array.from(walkElements(dir.props.children)).map(child =>
		child.key === child.props.name ? _absorbIndex(child, index) : child,
	) as TreeElement[];

	// Find the index child by key.
	const indexChild = recursed.find(child => anyMatch(child.key, ...index));
	if (!indexChild) return { ...dir, props: { ...dir.props, children: recursed } };

	// Fold the index child into the directory, and drop it from children.
	const remaining = recursed.filter(child => child !== indexChild);
	return {
		...dir,
		props: {
			...dir.props,
			title: dir.props.title ?? indexChild.props.title,
			description: dir.props.description ?? indexChild.props.description,
			content: dir.props.content ?? indexChild.props.content,
			children: mergeElements(indexChild.props.children, remaining),
		},
	};
}
