import { mergeElements, type TreeElement } from "../util/element.js";

/**
 * Base class for an extractor that converts input into a tree element.
 * - Extractors are composable: outer extractors delegate to inner extractors.
 * - The output type is always a `TreeElement` (or a more specific subtype like `TreeElement`).
 */
export abstract class Extractor<I, O extends TreeElement = TreeElement> {
	/** Extract a tree element from the given input. */
	abstract extract(input: I): Partial<O> | Promise<Partial<O>>;

	/**
	 * Priority used to resolve same-key collisions when merging elements.
	 * - Higher-priority elements contribute their `title`, `description`, `path` to the merged result.
	 * - Higher-priority elements a prefixed (rather than suffixed) in `children` and `content` when merged.
	 * - Defaults to `0`; subclasses override (e.g. `MarkdownExtractor` is `10`).
	 */
	readonly priority: number = 0;
}

/**
 * Merge two file elements with the same `key`.
 * - `title` and `path` are taken from `primary` (the higher-priority element).
 * - `description` is taken from `primary` if set, otherwise from `secondary`.
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
			title: primary.props.title,
			path: primary.props.path,
			description: primary.props.description ?? secondary.props.description,
			content: mergeElements(primary.props.content, secondary.props.content),
			children: mergeElements(primary.props.children, secondary.props.children),
		},
	};
}
