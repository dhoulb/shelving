import type { ImmutableArray } from "./array.js";
import type { Data } from "./data.js";
import type { Element, ElementProps, Elements } from "./element.js";
import { walkElements } from "./element.js";
import { type AbsolutePath, joinPath } from "./path.js";
import type { Query } from "./query.js";
import { queryItems } from "./query.js";
import { getWords } from "./string.js";

/**
 * Props for a tree element — must have a `tree-` prefixed type.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/TreeElementProps
 */
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
 *
 * @see https://dhoulb.github.io/shelving/util/tree/TreeElement
 */
export interface TreeElement<P extends TreeElementProps = TreeElementProps> extends Element<P> {
	readonly key: string;
	readonly type: `tree-${string}`;
}

/**
 * Collection of tree elements.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/TreeElements
 */
export type TreeElements = Elements<TreeElement>;

/**
 * A single parameter for a documented code symbol.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/DocumentationParam
 */
export interface DocumentationParam {
	readonly name: string;
	/** Type expression (e.g. `"string"`, `"number"`); renderers default to `"unknown"` when missing. */
	readonly type?: string | undefined;
	readonly description?: string | undefined;
	readonly optional?: boolean | undefined;
	/** Default-value expression from the parameter's initializer (e.g. `"false"`, `"{}"`), or `undefined` when the parameter has none. */
	readonly default?: string | undefined;
}

/**
 * A single `@returns` entry — multiple allowed to document union return types separately.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/DocumentationReturn
 */
export interface DocumentationReturn {
	/** Type expression for the return value; renderers default to `"unknown"` when missing. */
	readonly type?: string | undefined;
	readonly description?: string | undefined;
}

/**
 * A single `@throws` entry — multiple allowed to document distinct error types.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/DocumentationThrow
 */
export interface DocumentationThrow {
	/** Type expression for the thrown value; renderers default to `"unknown"` when missing. */
	readonly type?: string | undefined;
	readonly description?: string | undefined;
}

/**
 * A single `@example` entry — the example text/code block.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/DocumentationExample
 */
export interface DocumentationExample {
	readonly description?: string | undefined;
}

/**
 * Props for a documented code symbol — a single shape for any kind of code element.
 * - `kind` distinguishes the symbol category (e.g. `"function"`, `"class"`, `"property"`, or any string).
 * - All props are optional — not every kind uses every prop (e.g. `returns` only makes sense for functions).
 * - `signatures` is an array so overloaded function/method declarations can each contribute their own signature to the same documentation element.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/DocumentationElementProps
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
	/** Name of the class/interface this class/interface extends (e.g. `"AbstractStore"`). Raw string — resolved to a link at render time. */
	readonly extends?: string | undefined;
	/** Names of the interfaces this class/interface implements (e.g. `["Serializable"]`). Raw strings — resolved to links at render time; builtins simply stay as text. */
	readonly implements?: ImmutableArray<string> | undefined;
}

/**
 * Element representing a documented code symbol.
 * - The `kind` prop distinguishes specific symbol types (function, class, property, etc.) without baking the list in.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/DocumentationElement
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
 *   - its **flat key** — bare `name` (e.g. `"BooleanSchema"`), or qualified `"Class.member"` for members (e.g. `"BooleanSchema.validate"`). This is what cross-refs (`extends` / `implements`) and README links resolve through.
 *   - its **canonical path** (`element.props.path`, e.g. `"/schema/BooleanSchema"`) — what the router resolves a URL to.
 * - The map values keep their (stamped) children, so the map doubles as the navigable tree: `map.get("/")` is the stamped root and flattening never throws away the hierarchy. The router resolves a URL with `map.get(path)`; the static builder enumerates pages from the path-shaped keys.
 * - Each stamped element's own `key` is also set to its canonical `path` — so a flat (cross-tree) listing of stamped elements has globally-unique React keys, where the bare `name` would collide (many `get` / `value` / `url`).
 * - Exported names are unique across the package (barrel re-exports enforce it at compile time), so flat-key collisions are vanishingly rare; on a collision the last writer simply wins.
 * - Missing keys (e.g. builtins like `Serializable`) resolve to `undefined` → callers fall back to plain text.
 *
 * @param root The root element to flatten.
 * @param base An existing map to merge onto (copied, not mutated). Useful to combine several trees into one lookup.
 * @returns A new `Map` keyed by both flat key and canonical path, whose values are copies of every element stamped with its canonical `path`.
 * @example flattenTree(root).get("/schema/BooleanSchema") // the stamped `BooleanSchema` element
 * @see https://dhoulb.github.io/shelving/util/tree/flattenTree
 */
export function flattenTree(root: TreeElement, base?: ReadonlyMap<string, TreeElement>): Map<string, TreeElement> {
	const map = new Map<string, TreeElement>(base);
	_flattenElement(root, "/", map);
	return map;
}
function _flattenElement(element: TreeElement, path: AbsolutePath, map: Map<string, TreeElement>): TreeElement {
	// Rebuild children first (bottom-up) so the stamped element carries stamped children — the map doubles as the nested tree.
	const children = Array.from(walkElements(element.props.children), child => _flattenElement(child, joinPath(path, child.props.name), map));
	// Stamp the canonical `path` onto both `props.path` and the element's own `key` — the latter gives a flat listing of tree
	// elements globally-unique React keys (bare names like `get` / `value` / `url` collide across the tree).
	const stamped: TreeElement = {
		...element,
		key: path,
		props: { ...element.props, path, children: children.length ? children : undefined },
	};
	map.set(_flatKey(stamped), stamped);
	map.set(path, stamped);
	return stamped;
}
/** The module-less flat key for an element — `Class.member` for class/interface members, the bare `name` otherwise. */
function _flatKey(element: TreeElement): string {
	const { class: className, name } = element.props as DocumentationElementProps;
	return className ? `${className}.${name}` : name;
}

/**
 * Options for `searchTree()`.
 *
 * @see https://dhoulb.github.io/shelving/util/tree/SearchTreeOptions
 */
export interface SearchTreeOptions {
	/** Maximum number of results to return (defaults to `20`). */
	readonly limit?: number | undefined;
	/**
	 * Optional `Query` narrowing the candidates by *any* prop before ranking — the same shape `queryItems()` takes.
	 * - e.g. `{ kind: "method" }` to only rank methods, or `{ source: "…" }` to constrain by source.
	 */
	readonly filter?: Query | undefined;
}

/**
 * Search the descendants of a tree element and return the best-ranked matches.
 *
 * - Walks every descendant of `scope` (depth-first; `scope` itself is not a candidate), optionally narrowed by `options.filter`.
 * - Tokenises `query` with `getWords()` so quoted phrases match literally: `searchTree(root, '"hello world" foo')` scores the phrase `hello world` *and* the word `foo` independently, stacking their scores.
 * - Ranks each candidate (case-insensitive) per token, summing: `name` exact > `name` starts-with > `name` includes > `title` includes > `description` includes > `content` includes. A `name` match always outranks a content-only match.
 * - An empty `query` returns the (filtered) candidates in tree order — useful for a filter-only or "show everything" listing.
 *
 * @param scope The element whose descendants are searched.
 * @param query The search string — bare words plus `"quoted phrases"`.
 * @param options `limit` (default `20`) and an optional `filter` `Query` over each candidate's props.
 * @returns The matching descendants, best first, capped at `limit`.
 * @example searchTree(root, "store", { limit: 10, filter: { kind: "class" } }) // up to 10 classes ranked for "store"
 * @see https://dhoulb.github.io/shelving/util/tree/searchTree
 */
export function searchTree(scope: TreeElement, query: string, options?: SearchTreeOptions): TreeElement[] {
	const { limit = 20, filter } = options ?? {};

	// Gather every descendant of `scope`, optionally narrowed by a `filter` query over each element's props.
	let candidates = Array.from(_walkTree(scope));
	if (filter) {
		// `queryItems()` is typed for `Data`; element props are plain objects at runtime, so cast for the filter and map back by reference.
		const allowed = new Set(queryItems(candidates.map(el => el.props) as unknown as Iterable<Data>, filter));
		candidates = candidates.filter(el => allowed.has(el.props as unknown as Data));
	}

	// Tokenise the query — quoted phrases match literally, bare words match individually.
	const tokens = getWords(query.toLowerCase());

	// No query → return the (filtered) candidates in tree order, capped at `limit`.
	if (!tokens.length) return candidates.slice(0, limit);

	// Score every candidate, drop non-matches, sort by score descending, cap at `limit`.
	const scored = candidates.map(el => [el, _scoreElement(el.props, tokens)] as const).filter(([, score]) => score > 0);
	scored.sort((a, b) => b[1] - a[1]);
	return scored.slice(0, limit).map(([el]) => el);
}

/** Walk every descendant of a tree element depth-first — the element itself is not yielded. */
function* _walkTree(scope: TreeElement): Iterable<TreeElement> {
	for (const child of walkElements<TreeElement>(scope.props.children)) {
		yield child;
		yield* _walkTree(child);
	}
}

// Score tiers — separated by orders of magnitude so a single higher-tier hit outranks any realistic stack of lower-tier hits (a `name` match always beats a content-only match).
const _SCORE_NAME_EXACT = 10000;
const _SCORE_NAME_STARTS = 1000;
const _SCORE_NAME_INCLUDES = 100;
const _SCORE_TITLE = 10;
const _SCORE_DESCRIPTION = 4;
const _SCORE_CONTENT = 1;

/** Score one element's props against the (already lower-cased) query tokens — each token contributes its best-matching tier, summed. */
function _scoreElement(props: TreeElementProps, tokens: ImmutableArray<string>): number {
	const name = props.name.toLowerCase();
	const title = props.title?.toLowerCase() ?? "";
	const description = props.description?.toLowerCase() ?? "";
	const content = props.content?.toLowerCase() ?? "";
	let score = 0;
	for (const token of tokens) {
		if (name === token) score += _SCORE_NAME_EXACT;
		else if (name.startsWith(token)) score += _SCORE_NAME_STARTS;
		else if (name.includes(token)) score += _SCORE_NAME_INCLUDES;
		else if (title.includes(token)) score += _SCORE_TITLE;
		else if (description.includes(token)) score += _SCORE_DESCRIPTION;
		else if (content.includes(token)) score += _SCORE_CONTENT;
	}
	return score;
}
