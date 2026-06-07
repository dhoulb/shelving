import type { ImmutableArray } from "./array.js";
import type { Element, ElementProps, Elements } from "./element.js";
import { walkElements } from "./element.js";
import type { AbsolutePath } from "./path.js";

/** Props for a tree element — must have a `tree-` prefixed type. */
export interface TreeElementProps extends ElementProps {
	/**
	 * The primary identifier shown in menus, cards, and other listings.
	 * - Always set. For files this is the basename (e.g. `"array"` from `array.ts`); for directories it's the directory name;
	 *   for documented symbols it's the declared name (e.g. `"getFirst"`).
	 * - `key` is typically the slugified version of `name`.
	 */
	readonly name: string;
	/**
	 * Optional visual-only override for `name`, set only when a confident source is available
	 * (e.g. a markdown `<h1>`, a docblock title).
	 * - Renderers should fall back to `name` when `title` is missing.
	 */
	readonly title?: string | undefined;
	/**
	 * Short summary used for the page's `<meta name="description">` tag — not rendered as visible page body.
	 * - Pages plumb this through `Meta.description`; `<Head>` emits the meta tag.
	 * - For visible body content (rendered inside the page) use `content` instead.
	 */
	readonly description?: string | undefined;
	/**
	 * Markup source string that should be rendered as the element's visible body content.
	 * - Rendered via the `<Markup>` component (typically inside a `<Prose>` wrapper).
	 * - For Markdown files this is the file's body (the title `# h1` is lifted into `title`); for TypeScript symbols this is the JSDoc description.
	 */
	readonly content?: string | undefined;
	/**
	 * Source location for the element — the absolute filesystem path it was extracted from.
	 * - For directories this is the directory path; for files this is the file path.
	 * - Optional: synthesised elements (e.g. `kind: "module"` documentation) have no single source.
	 */
	readonly source?: AbsolutePath | undefined;
	/** Children of a tree element must be other tree elements. */
	readonly children?: TreeElements | undefined;
}

/**
 * Element in a heirarchical tree.
 * - Has a `tree-` prefixed type string.
 * - Requires a string `key` prop (can be resolved to a path).
 * - Props can include `title`, `description`, and/or `content` to be useful.
 */
export interface TreeElement<P extends TreeElementProps = TreeElementProps> extends Element<P> {
	readonly key: string;
	readonly type: `tree-${string}`;
}

/** Collection of tree elements. */
export type TreeElements = Elements<TreeElement>;

/** A single parameter for a documented code symbol. */
export interface DocumentationParam {
	readonly name: string;
	/** Type expression (e.g. `"string"`, `"number"`); renderers default to `"unknown"` when missing. */
	readonly type?: string | undefined;
	readonly description?: string | undefined;
	readonly optional?: boolean | undefined;
}

/** A single `@returns` entry — multiple allowed to document union return types separately. */
export interface DocumentationReturn {
	/** Type expression for the return value; renderers default to `"unknown"` when missing. */
	readonly type?: string | undefined;
	readonly description?: string | undefined;
}

/** A single `@throws` entry — multiple allowed to document distinct error types. */
export interface DocumentationThrow {
	/** Type expression for the thrown value; renderers default to `"unknown"` when missing. */
	readonly type?: string | undefined;
	readonly description?: string | undefined;
}

/** A single `@example` entry — the example text/code block. */
export interface DocumentationExample {
	readonly description?: string | undefined;
}

/**
 * Props for a documented code symbol — a single shape for any kind of code element.
 * - `kind` distinguishes the symbol category (e.g. `"function"`, `"class"`, `"property"`, or any string).
 * - All props are optional — not every kind uses every prop (e.g. `returns` only makes sense for functions).
 * - `signatures` is an array so overloaded function/method declarations can each contribute their own signature to the same documentation element.
 */
export interface DocumentationElementProps extends TreeElementProps {
	// `name` is inherited from `TreeElementProps` — the declared symbol name (e.g. `"getFirst"`).
	// `title` is inherited and remains optional — used only if a docblock provides a polished display title.
	readonly kind?: string | undefined;
	readonly signatures?: ImmutableArray<string> | undefined;
	readonly params?: ImmutableArray<DocumentationParam> | undefined;
	readonly returns?: ImmutableArray<DocumentationReturn> | undefined;
	readonly throws?: ImmutableArray<DocumentationThrow> | undefined;
	readonly examples?: ImmutableArray<DocumentationExample> | undefined;
	/** Name of the class/interface this member belongs to (e.g. `"Store"` for `Store.get()`). Set only on methods and properties. */
	readonly class?: string | undefined;
	/** Whether the property is read-only — a `readonly` field, or a getter with no matching setter. */
	readonly readonly?: boolean | undefined;
	/** Name of the base-class member this member overrides, qualified with the base class (e.g. `"AbstractStore.get"`). Raw string — resolved to a link at render time. */
	readonly overrides?: string | undefined;
	/** Name of the class/interface this class/interface extends (e.g. `"AbstractStore"`). Raw string — resolved to a link at render time. */
	readonly extends?: string | undefined;
	/** Names of the interfaces this class/interface implements (e.g. `["Serializable"]`). Raw strings — resolved to links at render time; builtins simply stay as text. */
	readonly implements?: ImmutableArray<string> | undefined;
}

/**
 * Element representing a documented code symbol.
 * - The `kind` prop distinguishes specific symbol types (function, class, property, etc.) without baking the list in.
 */
export interface DocumentationElement extends TreeElement<DocumentationElementProps> {
	readonly type: "tree-documentation";
}

// IntrinsicElements declarations for tree-* custom elements.

declare module "react" {
	// biome-ignore lint/style/noNamespace: Required for JSX IntrinsicElements augmentation.
	namespace JSX {
		interface IntrinsicElements {
			"tree-element": TreeElementProps;
			"tree-documentation": DocumentationElementProps;
		}
	}
}

/**
 * Resolve an element in a tree by walking a sequence of names from `root`.
 * - The `root` element's own name is never matched against path segments — it's the container, not a step in the path.
 * - A child's `name` may contain `/` separators, in which case it matches multiple consecutive path segments
 *   (e.g. a module named `"util/string"` matches the segments `["util", "string"]`).
 * - If `path` is empty, returns `root` itself.
 * - Returns `undefined` if no descendant matches at any level.
 *
 * Splitting the path:
 * - We accept a raw `Segments` array, so callers can join paths later however they wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To split the names in `a.b.c` dotted data format use `mapItems(getTreePaths(root), splitDataPath)`
 * - To split the names in `/a/b/c` absolute path format use `mapItems(getTreePaths(root), splitAbsolutePath)`
 *
 * @param root The root element to walk from. Its own `name` is treated as a label, not a path segment.
 * @param path An array of path segments naming descendants of `root`.
 *
 * @example resolveTreePath(root, ["util", "array"]) // Element with name "array" inside child with name "util"
 * @example resolveTreePath(root, ["util", "string"]) // Module child with composite name "util/string"
 * @example resolveTreePath(root, []) // `root` itself
 */
export function resolveTreePath(root: TreeElement, path: readonly string[]): TreeElement | undefined {
	if (!path.length) return root;
	for (const el of walkElements(root.props.children)) {
		const child = el as TreeElement;
		const nameSegments = child.props.name.split("/");
		if (nameSegments.length > path.length) continue;
		let matches = true;
		for (let i = 0; i < nameSegments.length; i++) {
			if (nameSegments[i] !== path[i]) {
				matches = false;
				break;
			}
		}
		if (!matches) continue;
		const result = resolveTreePath(child, path.slice(nameSegments.length));
		if (result) return result;
	}
	return undefined;
}

/**
 * Deeply iterate a tree from `root` and yield path segments for each reachable element.
 * - Yields `[]` for `root` itself.
 * - Yields `[name]` for each immediate child, `[name, name]` for grandchildren, etc.
 * - The `root` element's own name never appears in any yielded path — it's the container.
 * - Children with no `name` prop are skipped (and their descendants are not yielded).
 *
 * Joining the paths:
 * - We return a `Segments` array for each element, so callers can join paths later however they wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To join the names in `a.b.c` dotted data format use `mapItems(getTreePaths(root), joinDataPath)`
 * - To join the names in `/a/b/c` absolute path format use `mapItems(getTreePaths(root), p => joinPath("/", p))`
 *
 * @param root The root element to walk from. Its own `name` is treated as a label, not a path segment.
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields only `[]` (the root itself).
 *
 * @returns Iterable set of path segment arrays, each representing one descendant (or the root).
 */
export function getTreePaths(root: TreeElement, depth = Infinity): Iterable<readonly string[]> {
	return _walkTreePaths(root, depth, []);
}
function* _walkTreePaths(element: TreeElement, depth: number, path: readonly string[]): Iterable<readonly string[]> {
	yield path;
	if (depth <= 0) return;
	for (const child of walkElements(element.props.children)) {
		// Skip elements with no `name` prop (and their descendants).
		const name = child.props.name;
		yield* _walkTreePaths(child, depth - 1, [...path, name]);
	}
}

/** An entry in the flattened tree map — enough to render a cross-link (its `path` builds the href, its `title` the label). */
export interface TreeMapEntry {
	/** Path segments from the root down to the element (consumable by `joinPath()` / `resolveTreePath()`). */
	readonly path: readonly string[];
	/** The original tree element. */
	readonly element: TreeElement;
}

/**
 * Flatten a tree into a map for O(1) cross-reference lookup, optionally merged onto an existing `base` map.
 * - Walks the whole tree once and records every element (including the root) under several keys pointing at one `{ path, title }` entry:
 *   - its bare `name` (e.g. `"Store"`, `"get"`),
 *   - its qualified `"Class.member"` key when it's a documented member (e.g. `"Store.get"`), so a raw reference resolves unambiguously,
 *   - its joined path (e.g. `"store/Store/get"`, or `""` for the root), so an ancestor path resolves back to its title for breadcrumbs.
 * - On a key collision the first writer wins — pass a `base` map (e.g. a parent context's map) to merge several trees into one lookup; the base always wins, so outer trees take precedence.
 * - References with no entry (e.g. builtins like `Serializable`) are simply absent — callers fall back to plain text.
 *
 * @param root The root element to flatten. Its own name is treated as a container label, never a path segment (matching `getTreePaths()`).
 * @param base An existing map to merge onto (copied, not mutated). Its entries take precedence on collision.
 * @returns A map from reference/path key to its `{ path, title }` entry.
 */
export function flattenTree(root: TreeElement, base?: ReadonlyMap<string, TreeMapEntry>): Map<string, TreeMapEntry> {
	const map = new Map<string, TreeMapEntry>(base);
	_flattenElement(root, [], map);
	return map;
}
function _flattenElement(element: TreeElement, path: readonly string[], map: Map<string, TreeMapEntry>): void {
	const { name } = element.props;
	const entry: TreeMapEntry = { path, element };
	// Joined-path key (reverse lookup for breadcrumbs), bare name and qualified `Class.member` key — first writer wins for each.
	for (const key of [path.join("/"), name, _qualifiedKey(element)]) if (key !== undefined && !map.has(key)) map.set(key, entry);
	for (const child of walkElements(element.props.children)) _flattenElement(child, [...path, child.props.name], map);
}
function _qualifiedKey(element: TreeElement | DocumentationElement): string | undefined {
	if ("class" in element.props) {
		const { class: className, name } = element.props;
		if (className) return `${className}.${name}`;
	}
	return element.props.name;
}
