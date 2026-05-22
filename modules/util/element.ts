import type { ImmutableArray } from "./array.js";
import { isArray } from "./array.js";
import { isIterable } from "./iterate.js";
import type { AbsolutePath } from "./path.js";
import type { Query } from "./query.js";
import { queryItems } from "./query.js";

/** Set of valid props for an element. */
export type ElementProps = {
	readonly children?: Elements;
};

/**
 * Element with a type, props, and optional key (compatible with `React.ReactElement`).
 * - Declared as a `type`, not an `interface`, so its implicit index signature lets it satisfy `Data` — `queryElements()` runs elements through `queryItems<T extends Data>`.
 */
export type Element<P extends ElementProps = ElementProps> = {
	readonly type: string | ((props: P) => Elements | null);
	readonly props: P;
	readonly key: string | null;
	readonly $$typeof?: symbol;
};

/** Collection of elements (compatible with `React.ReactNode`). */
export type Elements<T extends Element = Element> = undefined | null | string | T | Iterable<Elements<T>>;

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

/** Props for a directory element. */
export interface DirectoryElementProps extends TreeElementProps {
	/**
	 * Source location for the element — the absolute filesystem path it was extracted from.
	 * - For directories this is the directory path; for files this is the file path.
	 */
	readonly source: AbsolutePath;
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
	/**
	 * Source location for the element — the absolute filesystem path it was extracted from.
	 * - For directories this is the directory path; for files this is the file path.
	 */
	readonly source: AbsolutePath;
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
 * - A `<br>` element becomes a newline (`\n`) — matching DOM `innerText`, so words either side of a line break don't fuse together.
 *
 * @param elements An element, a plain string, or null/undefined (or an array of those things).
 * @returns The combined string made from the elements.
 *
 * @example `- Item with *strong*\n- Item with _em_` becomes `Item with strong Item with em`
 */
export function getElementText(elements: Elements): string {
	if (typeof elements === "string") return elements;
	if (isElement(elements)) {
		// A `<br>` carries no children but renders as a line break — emit `\n` so adjacent words stay separated.
		if (elements.type === "br") return "\n";
		return getElementText(elements.props.children);
	}
	// Iterate the collection directly — `walkElements()` skips loose strings, so it would drop text that sits alongside elements.
	if (isIterable(elements)) {
		let text = "";
		for (const child of elements) text += getElementText(child);
		return text;
	}
	return "";
}

/**
 * Walk an `Elements` value into a flat iterable of `Element` objects.
 * - Accepts any shape the `Elements` union allows: a single element, a (possibly deeply nested) iterable, `null`, `undefined`, or a string (strings are skipped — there's no element to yield).
 * - Recurses through *iterable nesting* only (e.g. `[[a, b], c]` flattens to `a, b, c`); it does NOT descend into an element's own `props.children`. Walking deeper is the consumer's job.
 *
 * The point of this helper is to remove the "is it one element, a list, undefined, or some nested thing" branching from every consumer that needs to dispatch over elements — pass it in, get a clean flat iterable out.
 */
export function walkElements<T extends Element>(elements: Elements<T>): Iterable<T>;
export function walkElements(elements: Elements): Iterable<Element>;
export function* walkElements(elements: Elements): Iterable<Element> {
	if (isElement(elements)) yield elements;
	else if (isIterable(elements)) for (const x of elements) yield* walkElements(x);
}

/**
 * Filter elements yielded by `walkElements()` using a `Query<Element>` object.
 * - Supports any property query (e.g. `{ type: "tree-file" }`, `{ type: ["tree-file", "tree-directory"] }`), sorting, limiting — anything `queryItems()` accepts.
 */
export function queryElements(elements: Elements, query: Query<Element>): Iterable<Element> {
	return queryItems(walkElements(elements), query) as Iterable<Element>;
}

/** Filter elements yielded by `walkElements()` using a match function. */
export function* filterElements(elements: Elements, match: (element: Element) => boolean): Iterable<Element> {
	for (const element of walkElements(elements)) if (match(element)) yield element;
}

/**
 * Resolve an element in a tree by walking a sequence of names from `root`.
 * - The `root` element's own name is never matched against path segments — it's the container, not a step in the path.
 * - Each segment matches the `name` prop of an immediate child of the current element.
 * - If `path` is empty, returns `root` itself.
 * - Returns `undefined` if no descendant matches at any level.
 *
 * Splitting the path:
 * - We accept a raw `Segments` array, so callers can join paths later however they wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To split the names in `a.b.c` dotted data format use `mapItems(getElementPaths(root), splitDataPath)`
 * - To split the names in `/a/b/c` absolute path format use `mapItems(getElementPaths(root), splitAbsolutePath)`
 *
 * @param root The root element to walk from. Its own `name` is treated as a label, not a path segment.
 * @param path An array of path segments naming descendants of `root`.
 *
 * @example resolveElementPath(root, ["util", "array"]) // Element with name "array" inside child with name "util"
 * @example resolveElementPath(root, []) // `root` itself
 */
export function resolveElementPath(root: TreeElement, path: readonly string[]): TreeElement | undefined {
	let current: TreeElement = root;
	for (const segment of path) {
		let found: TreeElement | undefined;
		for (const el of walkElements(current.props.children)) {
			if ((el as TreeElement).props.name === segment) {
				found = el as TreeElement;
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
 * - Yields `[name]` for each immediate child, `[name, name]` for grandchildren, etc.
 * - The `root` element's own name never appears in any yielded path — it's the container.
 * - Children with no `name` prop are skipped (and their descendants are not yielded).
 *
 * Joining the paths:
 * - We return a `Segments` array for each element, so callers can join paths later however they wish.
 * - Element paths have no canonical string representation so we use `Segments` instead.
 * - To join the names in `a.b.c` dotted data format use `mapItems(getElementPaths(root), joinDataPath)`
 * - To join the names in `/a/b/c` absolute path format use `mapItems(getElementPaths(root), p => joinPath("/", p))`
 *
 * @param root The root element to walk from. Its own `name` is treated as a label, not a path segment.
 * @param depth Controls how many levels of children to recurse into (defaults to infinite depth).
 * - `depth=0` yields only `[]` (the root itself).
 *
 * @returns Iterable set of path segment arrays, each representing one descendant (or the root).
 */
export function getElementPaths(root: TreeElement, depth = Infinity): Iterable<readonly string[]> {
	return _walkElementPaths(root, depth, []);
}
function* _walkElementPaths(element: TreeElement, depth: number, path: readonly string[]): Iterable<readonly string[]> {
	yield path;
	if (depth <= 0) return;
	for (const child of walkElements(element.props.children)) {
		// Skip elements with no `name` prop (and their descendants).
		const name = (child as TreeElement).props.name;
		yield* _walkElementPaths(child as TreeElement, depth - 1, [...path, name]);
	}
}

/** Combine two `Elements`, preserving both if both are set. */
export function mergeElements<T extends Element>(a: Elements<T>, b: Elements<T>): Elements<T>;
export function mergeElements(a: Elements, b: Elements): Elements;
export function mergeElements(a: Elements, b: Elements): Elements {
	if (!a) return b;
	if (!b) return a;
	return [a, b] as Elements;
}
