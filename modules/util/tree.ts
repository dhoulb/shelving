import type { ImmutableArray } from "./array.js";
import type { Element, ElementProps, Elements } from "./element.js";
import { walkElements } from "./element.js";
import { type AbsolutePath, joinPath } from "./path.js";

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
	/**
	 * Canonical site-root-relative URL path of this element (e.g. `"/schema/BooleanSchema"`), stamped by `flattenTree()`.
	 * - This is the exact URL the element renders at, and the canonical key it's registered under in `flattenTree()`.
	 * - Absent on a freshly-extracted tree — paths are derived from tree structure when the tree is flattened, not at extraction.
	 */
	readonly path?: AbsolutePath | undefined;
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
 * Flatten a tree into a `Map` for O(1) lookup, stamping a canonical `path` onto every element as it walks.
 * - Returns a *copy* of the tree, indexed. Each element is rebuilt with its canonical site-root-relative `path`: the root is `/`, each descendant is `parentPath + "/" + name` — so a module `schema` → `/schema`, its class `BooleanSchema` → `/schema/BooleanSchema`, its member `validate` → `/schema/BooleanSchema/validate`. A composite module name (e.g. `"util/string"`) becomes its own multi-segment chunk.
 * - Every element is registered under two keys, both pointing at the (stamped) element:
 *   - its **flat key** — bare `name` (e.g. `"BooleanSchema"`), or qualified `"Class.member"` for members (e.g. `"BooleanSchema.validate"`). This is what cross-refs (`extends` / `overrides`) and README links resolve through.
 *   - its **canonical path** (`element.props.path`, e.g. `"/schema/BooleanSchema"`) — what the router resolves a URL to.
 * - The map values keep their (stamped) children, so the map doubles as the navigable tree: `map.get("/")` is the stamped root and flattening never throws away the hierarchy. The router resolves a URL with `map.get(path)`; the static builder enumerates pages from the path-shaped keys.
 * - Exported names are unique across the package (barrel re-exports enforce it at compile time), so flat-key collisions are vanishingly rare; on a collision the last writer simply wins.
 * - Missing keys (e.g. builtins like `Serializable`) resolve to `undefined` → callers fall back to plain text.
 *
 * @param root The root element to flatten.
 * @param base An existing map to merge onto (copied, not mutated). Useful to combine several trees into one lookup.
 */
export function flattenTree(root: TreeElement, base?: ReadonlyMap<string, TreeElement>): Map<string, TreeElement> {
	const map = new Map<string, TreeElement>(base);
	_flattenElement(root, "/", map);
	return map;
}
function _flattenElement(element: TreeElement, path: AbsolutePath, map: Map<string, TreeElement>): TreeElement {
	// Rebuild children first (bottom-up) so the stamped element carries stamped children — the map doubles as the nested tree.
	const children = Array.from(walkElements(element.props.children), child => _flattenElement(child, joinPath(path, child.props.name), map));
	const stamped: TreeElement = { ...element, props: { ...element.props, path, children: children.length ? children : undefined } };
	map.set(_flatKey(stamped), stamped);
	map.set(path, stamped);
	return stamped;
}
/** The module-less flat key for an element — `Class.member` for class/interface members, the bare `name` otherwise. */
function _flatKey(element: TreeElement): string {
	const { class: className, name } = element.props as DocumentationElementProps;
	return className ? `${className}.${name}` : name;
}
