import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import { isNullish } from "./null.js";
import type { AbsolutePath } from "./path.js";
import type { Query } from "./query.js";
import { queryItems } from "./query.js";

/** Set of valid props for an element. */
export interface ElementProps {
	readonly [key: string]: unknown;
	readonly children?: Elements;
}

/** Element with a type, props, and optional key (compatible with `React.ReactElement`). */
export interface Element<P extends ElementProps = ElementProps> {
	readonly [key: string]: unknown;
	readonly type: string | ((props: P) => Elements | null);
	readonly props: P;
	readonly key: string | null;
	readonly $$typeof?: symbol;
}

/** Collection of elements (compatible with `React.ReactNode`). */
export type Elements = undefined | null | string | Element | Iterable<Elements>;

/** Props for a tree element — must have a `tree-` prefixed type. */
export interface TreeElementProps extends ElementProps {
	/**
	 * The primary identifier shown in menus, cards, and other listings.
	 * - Always set. For files this is the basename (e.g. `"array.ts"`); for directories it's the directory name;
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
	 * - For Markdown files this is the file's text; for TypeScript symbols this is the JSDoc description.
	 */
	readonly content?: string | undefined;
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
export type TreeElements = undefined | null | TreeElement | Iterable<TreeElements>;

/** Props for a directory element. */
export interface DirectoryElementProps extends TreeElementProps {
	readonly path: AbsolutePath;
}

/**
 * Element representing a directory in a file tree.
 * - Content is absorbed from an index file (e.g. `README.md` or `INDEX.md`) if present.
 * - Children are the files and subdirectories within this directory.
 */
export interface DirectoryElement extends TreeElement<DirectoryElementProps> {
	readonly type: "tree-directory";
}

/** Props for a file element. */
export interface FileElementProps extends TreeElementProps {
	// `name` is inherited from `TreeElementProps` — the basename including extension (e.g. `"array.ts"`).
}

/**
 * Element representing a file in a file tree.
 * - For TypeScript files, children are the exported code symbols.
 * - For Markdown files, children are typically empty (content is the parsed markdown).
 */
export interface FileElement extends TreeElement<FileElementProps> {
	readonly type: "tree-file";
}

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
	readonly extends?: string | undefined;
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
			"tree-directory": DirectoryElementProps;
			"tree-file": FileElementProps;
			"tree-documentation": DocumentationElementProps;
		}
	}
}

/** Is an unknown value an element? */
export function isElement(value: unknown): value is Element {
	return typeof value === "object" && value !== null && "type" in value;
}

/** Is an unknown value a collection of elements? */
export function isElements(value: unknown): value is Elements {
	return value === null || typeof value === "string" || isElement(value) || isArray(value);
}

/**
 * Strip all tags from elements to produce a plain text string.
 *
 * @param elements An element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the elements.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function getElementText(elements: Elements): string {
	if (typeof elements === "string") return elements;
	if (isElement(elements)) return getElementText(elements.props.children);
	return Array.from(getElements(elements)).map(getElementText).join("");
}

/**
 * An element yielded by a walker, with its ancestor-chain path attached.
 * - `path` is the chain of `key`s from the walk-root, including the element's own key as the last entry.
 * - Path is relative to whatever was passed in: `getElements(tree)` yields elements with path starting at `tree.key`; `getElements(tree.props.children)` yields elements with path starting at each child's `key`.
 */
export type WalkedElement<E extends Element = Element> = E & { readonly path: readonly string[] };

/**
 * Iterate through all elements in a collection.
 * - Yields each element as a `WalkedElement` with its ancestor-chain `path` attached.
 * - Recurses into `props.children` up to `depth` levels.
 *
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields elements at the current level only (no recursion into children).
 */
export function getElements(elements: Elements, depth = Infinity): Iterable<WalkedElement> {
	return _walkElements(elements, depth, []);
}
function* _walkElements(elements: Elements, depth: number, parents: readonly string[]): Iterable<WalkedElement> {
	if (isElement(elements)) {
		const path: readonly string[] = elements.key !== null ? [...parents, elements.key] : parents;
		yield { ...elements, path } as WalkedElement;
		if (depth > 0 && elements.props.children) yield* _walkElements(elements.props.children, depth - 1, path);
	} else if (isIterable(elements)) {
		for (const x of elements) yield* _walkElements(x, depth, parents);
	}
}

/**
 * Query elements using a `Query<Element>` object, leveraging the same query system as `queryItems()`.
 * - Extracts all elements via `getElements()` up to `depth` levels, then applies the query.
 * - Supports filtering by any element property (e.g. `{ type: "tree-file" }`), sorting, and limiting.
 *
 * @param elements The elements to query.
 * @param query A `Query<Element>` object (e.g. `{ type: "tree-file" }` or `{ type: ["tree-file", "tree-directory"] }`).
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 */
export function queryElements(elements: Elements, query: Query<Element>, depth = Infinity): Iterable<WalkedElement> {
	return queryItems(getElements(elements, depth), query) as Iterable<WalkedElement>;
}

/**
 * Filter elements using a match function.
 * - Yields each matching `Element`, recursing into `props.children` up to `depth` levels.
 *
 * @param elements The elements to filter.
 * @param match Function that tests whether an element should be yielded.
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields matching elements at the current level only (no recursion into children).
 */
export function* filterElements(elements: Elements, match: (element: Element) => boolean, depth = Infinity): Iterable<WalkedElement> {
	for (const element of getElements(elements, depth)) if (match(element)) yield element;
}

/**
 * Resolve an element in a tree by walking a sequence of keys from `root`.
 * - The `root` element's own key is never matched against path segments — it's the container, not a step in the path.
 * - Each segment matches the `key` of an immediate child of the current element.
 * - If `path` is empty, returns `root` itself.
 * - Returns `undefined` if no descendant matches at any level.
 *
 * Splitting the path:
 * - We accept a raw `Segments` array, so callers can join paths later however they wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To split the keys in `a.b.c` dotted data format use `mapItems(getElementPaths(root), splitDataPath)`
 * - To split the keys in `/a/b/c` absolute path format use `mapItems(getElementPaths(root), splitAbsolutePath)`
 *
 * @param root The root element to walk from. Its own `key` is treated as a label, not a path segment.
 * @param path An array of path segments naming descendants of `root`.
 *
 * @example resolveElementPath(root, ["util", "array"]) // Element with key "array" inside child with key "util"
 * @example resolveElementPath(root, []) // `root` itself
 */
export function resolveElementPath(root: TreeElement, path: readonly string[]): Element | undefined {
	let current: Element = root;
	for (const segment of path) {
		let found: Element | undefined;
		for (const el of getElements(current.props.children, 0)) {
			if (el.key === segment) {
				found = el;
				break;
			}
		}
		if (!found) return undefined;
		current = found;
	}
	return current;
}

/**
 * Deeply iterate a tree from `root` and yield path segments for each reachable element.
 * - Yields `[]` for `root` itself.
 * - Yields `[key]` for each immediate child, `[key, key]` for grandchildren, etc.
 * - The `root` element's own key never appears in any yielded path — it's the container.
 * - Children with `undefined` or `null` keys are skipped (and their descendants are not yielded).
 *
 * Joining the paths:
 * - We return a `Segments` array for each element, so callers can join paths later however they wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To join the keys in `a.b.c` dotted data format use `mapItems(getElementPaths(root), joinDataPath)`
 * - To join the keys in `/a/b/c` absolute path format use `mapItems(getElementPaths(root), joinAbsolutePath)`
 *
 * @param root The root element to walk from. Its own `key` is treated as a label, not a path segment.
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields only `[]` (the root itself).
 *
 * @returns Iterable set of path segment arrays, each representing one descendant (or the root).
 */
export function getElementPaths(root: TreeElement, depth = Infinity): Iterable<readonly string[]> {
	return _getElementPaths(root, depth);
}
function* _getElementPaths(root: TreeElement, depth: number): Iterable<readonly string[]> {
	yield [];
	if (depth > 0) yield* _getDescendantPaths(root.props.children, depth - 1);
}
function* _getDescendantPaths(elements: Elements, depth: number, prefix?: readonly string[]): Iterable<readonly string[]> {
	for (const { key, props } of getElements(elements, 0)) {
		// Skip `null` or `undefined` keys (and their descendants).
		if (isNullish(key)) continue;

		// Make the path and yield it.
		const keys: readonly string[] = prefix ? [...prefix, key] : [key];
		yield keys;

		// Recurse into the children.
		if (depth > 0 && props.children) yield* _getDescendantPaths(props.children, depth - 1, keys);
	}
}

/** Combine two `Elements`, preserving both if both are set. */
export function mergeElements<T extends Elements>(a: T, b: T): T;
export function mergeElements(a: Elements, b: Elements): Elements;
export function mergeElements(a: Elements, b: Elements): Elements {
	if (!a) return b;
	if (!b) return a;
	return [a, b];
}
