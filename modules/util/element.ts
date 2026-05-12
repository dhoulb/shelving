import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import { isNullish } from "./null.js";
import type { AbsolutePath } from "./path.js";
import type { Query } from "./query.js";
import { queryItems } from "./query.js";
import type { Segments } from "./string.js";

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
	readonly title: string;
	readonly description?: string | undefined;
	readonly content?: Elements | undefined;
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
	readonly name: string;
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
	readonly name: string;
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
	readonly type?: string | undefined;
	readonly description?: string | undefined;
	readonly optional?: boolean | undefined;
}

/**
 * Props for a documented code symbol — a single shape for any kind of code element.
 * - `kind` distinguishes the symbol category (e.g. `"function"`, `"class"`, `"property"`, or any string).
 * - All props are optional — not every kind uses every prop (e.g. `returns` only makes sense for functions).
 */
export interface DocumentationElementProps extends TreeElementProps {
	readonly kind?: string | undefined;
	readonly signature?: string | undefined;
	readonly params?: ImmutableArray<DocumentationParam> | undefined;
	readonly returns?: string | undefined;
	readonly examples?: ImmutableArray<string> | undefined;
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
 * Iterate through all elements in a collection.
 * - Yields each `Element` found, recursing into `props.children` up to `depth` levels.
 *
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields elements at the current level only (no recursion into children).
 */
export function* getElements(elements: Elements, depth = Infinity): Iterable<Element> {
	if (isElement(elements)) {
		yield elements; // Yield the element itself.
		if (depth > 0 && elements.props.children) yield* getElements(elements.props.children, depth - 1); // Yield each child-element.
	} else if (isIterable(elements)) {
		for (const x of elements) yield* getElements(x, depth);
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
export function queryElements(elements: Elements, query: Query<Element>, depth = Infinity): Iterable<Element> {
	return queryItems(getElements(elements, depth), query);
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
export function* filterElements(elements: Elements, match: (element: Element) => boolean, depth = Infinity): Iterable<Element> {
	for (const element of getElements(elements, depth)) if (match(element)) yield element;
}

/**
 * Resolve an element in a tree by walking a sequence of keys.
 * - Accepts a dot-separated string (e.g. `"util.array"`) or an array of path segments (e.g. `["util", "array"]`).
 * - Matches each segment to the `key` of an immediate child element.
 * - If `keys` is empty, undefined, or an empty string, returns the first keyed element at the root level.
 * - Returns `undefined` if no element matches at any level.
 *
 * Splitting the path:
 * - We accept a raw `Segments` array for each element, so they can be joined later however you wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To split the keys in `a.b.c` dotted data format use `mapItems(getElementPaths(elements), splitDataPath)`
 * - To split the keys in `/a/b/c` absolute path format use `mapItems(getElementPaths(elements), splitAbsolutePath)`
 *
 * @param elements The root elements to search within.
 * @param path An array of path segments.
 * - Element paths have no canonical string representation so we always us the `Segments` format.
 *
 * @example resolveElement(elements, "util.array") // Element with key "array" inside element with key "util"
 * @example resolveElement(elements, ["util", "array"]) // Same as above
 * @example resolveElement(elements, "") // First keyed root element
 */
export function resolveElementPath(elements: Elements, path: Segments): Element | undefined {
	let current: Elements = elements;
	let found: Element | undefined;

	for (const segment of path) {
		found = undefined;
		for (const el of getElements(current, 0)) {
			if (el.key === segment) {
				found = el;
				break;
			}
		}
		if (!found) return undefined;
		current = found.props.children;
	}

	return found;
}

/**
 * Deeply iterate a tree of elements and yield an array of path segments for each element that has a string `key:` property.
 * - Each yielded value is an array of path segments from root to the element.
 * - Only elements with a string `key:` property are included.
 * - Elements with `undefined` or `null` key are skipped.
 *
 * Joining the paths:
 * - We return a `Segments` array for each element, so they can be joined later however you wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To join the keys in `a.b.c` dotted data format use `mapItems(getElementPaths(elements), joinDataPath)`
 * - To join the keys in `/a/b/c` absolute path format use `mapItems(getElementPaths(elements), joinAbsolutePath)`
 *
 * @param elements The elements to get keys for.
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields matching elements at the current level only (no recursion into children).
 *
 * @returns Iterable set of path segment arrays, each representing one component.
 * - Element paths have no canonical string representation so we always us the `Segments` format.
 */
export function getElementPaths(elements: Elements, depth = Infinity): Iterable<Segments> {
	return _getElementPaths(elements, depth);
}
export function* _getElementPaths(elements: Elements, depth: number, prefix?: Segments): Iterable<Segments> {
	for (const { key, props } of getElements(elements, 0)) {
		// Skip `null` or `undefined` keys.
		if (isNullish(key)) continue;

		// Make the path and yield it.
		const keys: Segments = prefix ? [...prefix, key] : [key];
		yield keys;

		// Recurse into the children.
		if (depth > 0 && props.children) yield* _getElementPaths(props.children, depth - 1, keys);
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
