import type { ImmutableArray } from "../../util/array.js";
import { type DictionaryItem, getDictionaryItems, type ImmutableDictionary } from "../../util/dictionary.js";
import type { AnyCaller } from "../../util/function.js";
import { type PossibleLink, requireLink } from "../../util/link.js";
import type { Nullish } from "../../util/null.js";
import { type ImmutableURI, type PossibleURI, type PossibleURIParams, withURIParams } from "../../util/uri.js";
import { type ImmutableURL, type PossibleURL, requireURL } from "../../util/url.js";

/**
 * Set of named meta `<meta />` tags in `{ name: content }` format.
 *
 * @see https://shelving.cc/ui/MetaTags
 */
export type MetaTags = ImmutableDictionary<string | boolean | null | undefined>;

/**
 * Set of resolved meta `<link />` tags in `{ rel: href }` format (hrefs already absolutified to `ImmutableURI`).
 *
 * @see https://shelving.cc/ui/MetaLinks
 */
export type MetaLinks = ImmutableDictionary<ImmutableURI>;

/**
 * Set of input meta `<link />` tags in `{ rel: href }` format, before hrefs are resolved.
 *
 * @see https://shelving.cc/ui/PossibleMetaLinks
 */
export type PossibleMetaLinks = ImmutableDictionary<Nullish<PossibleLink>>;

/**
 * Set of resolved linked assets in `(href)[]` format (hrefs already absolutified to `ImmutableURI`).
 *
 * @see https://shelving.cc/ui/MetaAssets
 */
export type MetaAssets = ImmutableArray<ImmutableURI>;

/**
 * Set of input linked assets in `(href)[]` format, before hrefs are resolved.
 *
 * @see https://shelving.cc/ui/PossibleMetaAssets
 */
export type PossibleMetaAssets = ImmutableArray<Nullish<PossibleLink>>;

/**
 * Type for a meta `Content-Security-Policy` tag in `{ resource: string[] }` format.
 *
 * @see https://shelving.cc/ui/MetaCSP
 */
export type MetaCSP = { readonly [resource: string]: string[] };

/**
 * Combined meta data for a website page — title, URLs, description, CSP, tags, links, and assets.
 *
 * @see https://shelving.cc/ui/Meta
 */
export interface Meta {
	/** Base URL for the app (used to resolve `url` and set as `<base>` tag in `<Head>`). */
	readonly root?: ImmutableURL | undefined;
	/** URL of the current page (used to update history API and as the initial URL for routing). */
	readonly url?: ImmutableURL | undefined;
	/** Title of the entire application. */
	readonly app?: string | undefined;
	/** Title of the current page (set as `<title>` in `<Head>` */
	readonly title?: string | undefined;
	/** Description of the current page. */
	readonly description?: string | undefined;
	readonly image?: string | undefined;
	/** Language code (used for `lang` tag in HTML). */
	readonly language?: string | undefined;

	// Meta.
	readonly csp?: MetaCSP | undefined;
	readonly tags?: MetaTags | undefined;

	// Links and assets.
	readonly links?: MetaLinks | undefined;
	readonly modules?: MetaAssets | undefined;
	readonly scripts?: MetaAssets | undefined;
	readonly stylesheets?: MetaAssets | undefined;
}

/**
 * Input metadata that can be parsed and converted to a fully-resolved `Meta`.
 *
 * @see https://shelving.cc/ui/PossibleMeta
 */
export interface PossibleMeta extends Omit<Meta, "root" | "url" | "links" | "scripts" | "modules" | "stylesheets"> {
	/** Base URL for the app — accepts a string or `URL`, resolved with `requireURL()`. */
	readonly root?: PossibleURL | undefined;

	/**
	 * New URL for the page.
	 * - Resolved using `requireURL()` if set relative to `root`
	 */
	readonly url?: PossibleURI | undefined;

	/**
	 * Set the params in the URL (not merged with existing params).
	 * - Added to `url` after it is resolved.
	 * - Baseically
	 */
	readonly params?: PossibleURIParams | undefined;

	// Possible links and assets.
	readonly links?: PossibleMetaLinks | undefined;
	readonly modules?: PossibleMetaAssets | undefined;
	readonly scripts?: PossibleMetaAssets | undefined;
	readonly stylesheets?: PossibleMetaAssets | undefined;
}

/**
 * Turn a deconstructed `MetaCSP` into a `Content-Security-Policy` string.
 *
 * @param csp The CSP to join, as a `{ resource: string[] }` object or a ready-made string.
 * @returns The joined CSP string, or `undefined` if `csp` was nullish.
 * @example joinMetaCSP({ "default-src": ["'self'"], "img-src": ["*"] }) // "default-src 'self'; img-src *"
 * @see https://shelving.cc/ui/joinMetaCSP
 */
export function joinMetaCSP(csp: Nullish<MetaCSP>): string | undefined {
	if (typeof csp === "string") return csp;
	if (csp !== null && csp !== undefined) return Object.entries(csp).map(_mapCSP).join("; ");
}
const _mapCSP = ([key, content]: [string, string[]]) => `${key} ${content.join(" ")}`;

/**
 * Join several page or site titles together with ` - `, skipping empty values.
 *
 * @param titles Title segments to join, most-specific first.
 * @returns The joined title string.
 * @example joinTitles("Messages", "Manchester Runners") // "Messages - Manchester Runners"
 * @see https://shelving.cc/ui/joinTitles
 */
export function joinTitles(...titles: (string | undefined)[]): string {
	return titles.filter(Boolean).join(" - ");
}

/**
 * Merge a `PossibleMeta` onto an existing `Meta`, resolving URLs and assets in the process.
 *
 * - `title` is merged with `joinTitles()`.
 * - `url` is resolved to an absolute URL, e.g. `./d/e/f` + `/a/b/c` becomes `https://d.com/a/b/c/d/e/f`
 * - `stylesheets` and `links` hrefs newly set in `meta2` are absolutified against the merged `url`/`root`, so they stay correct no matter where they are later rendered.
 *
 * @param meta1 The existing fully-resolved `Meta` to merge into.
 * @param meta2 The new `PossibleMeta` to apply on top.
 * @param caller Function to attribute thrown URL-resolution errors to (defaults to `mergeMeta`).
 * @returns A new fully-resolved `Meta` combining both inputs.
 * @example mergeMeta(currentMeta, { title: "Messages", url: "./messages" })
 * @see https://shelving.cc/ui/mergeMeta
 */
export function mergeMeta(meta1: Meta, meta2: PossibleMeta, caller: AnyCaller = mergeMeta): Meta {
	const title = joinTitles(meta2.title, meta1.title);

	const root = mergeMetaURL(undefined, meta1.root, meta2.root, undefined, caller);
	const url = mergeMetaURL(root, meta1.url, meta2.url, meta2.params, caller);

	return {
		...meta1,
		...meta2,
		root,
		url,
		title,
		tags: mergeMetaTags(meta1.tags, meta2.tags),
		links: mergeMetaLinks(meta1.links, meta2.links, url, root, caller),
		modules: mergeMetaAssets(meta1.modules, meta2.modules, url, root, caller),
		scripts: mergeMetaAssets(meta1.scripts, meta2.scripts, url, root, caller),
		stylesheets: mergeMetaAssets(meta1.stylesheets, meta2.stylesheets, url, root, caller),
	};
}

/**
 * Create a fully-formed `Meta` from a `PossibleMeta`.
 *
 * - Like `mergeMeta()` but with no previous `Meta` to merge into — initialises meta from scratch.
 *
 * @param meta The input `PossibleMeta` to resolve.
 * @param caller Function to attribute thrown URL-resolution errors to (defaults to `createMeta`).
 * @returns A new fully-resolved `Meta`.
 * @example createMeta({ app: "Manchester Runners", url: "https://run.com" })
 * @see https://shelving.cc/ui/createMeta
 */
export function createMeta(meta: PossibleMeta, caller: AnyCaller = createMeta): Meta {
	return mergeMeta({}, meta, caller);
}

/**
 * Merge a new metadata URL onto the current one, resolving it and applying params.
 *
 * - New URL is resolved relative to the `base` URL, falling back to `current` when unset.
 *
 * @param base Base URL to resolve `next` against.
 * @param current The current URL, used when `next` is unset.
 * @param next The new (possibly relative) URL to resolve.
 * @param params URI params to set on the resolved URL (replaces existing params).
 * @param caller Function to attribute thrown URL-resolution errors to (defaults to `mergeMetaURL`).
 * @returns The resolved URL, or `undefined` if neither `next` nor `current` was set.
 * @see https://shelving.cc/ui/mergeMetaURL
 */
export function mergeMetaURL(
	base: ImmutableURL | undefined,
	current: ImmutableURL | undefined,
	next: PossibleURL | undefined,
	params: PossibleURIParams | undefined,
	caller: AnyCaller = mergeMetaURL,
): ImmutableURL | undefined {
	const url = next ? requireURL(next, base, caller) : current;
	return url && params ? withURIParams(url, params, caller) : url;
}

/**
 * Merge two sets of meta `<meta>` tags, with `next` taking precedence over `current`.
 *
 * @param current The existing tags.
 * @param next The new tags to merge on top.
 * @returns The merged tags, or `undefined` if both inputs were unset.
 * @see https://shelving.cc/ui/mergeMetaTags
 */
export function mergeMetaTags(current: MetaTags | undefined, next: MetaTags | undefined): MetaTags | undefined {
	return current && next ? { ...current, ...next } : current || next;
}

/**
 * Merge two meta `<link>` lists, resolving the new hrefs to absolute URIs.
 *
 * - New links are resolved relative to current URL (relative paths) and root URL (absolute paths).
 *
 * @param current The existing resolved links.
 * @param next The new (possibly relative) links to merge on top.
 * @param url The current page URL, used to resolve relative hrefs.
 * @param root The root URL, used to resolve absolute hrefs.
 * @param caller Function to attribute thrown URL-resolution errors to (defaults to `mergeMetaLinks`).
 * @returns The merged resolved links, or `undefined` if there was nothing to merge.
 * @see https://shelving.cc/ui/mergeMetaLinks
 */
export function mergeMetaLinks(
	current: MetaLinks | undefined,
	next: PossibleMetaLinks | undefined,
	url: ImmutableURL | undefined,
	root: ImmutableURL | undefined,
	caller: AnyCaller = mergeMetaLinks,
): MetaLinks | undefined {
	return next ? { ...current, ...Object.fromEntries(_yieldMetaLinkEntries(next, url, root, caller)) } : current;
}
function* _yieldMetaLinkEntries(
	links: PossibleMetaLinks,
	url: ImmutableURL | undefined,
	root: ImmutableURL | undefined,
	caller: AnyCaller,
): Iterable<DictionaryItem<ImmutableURI>> {
	for (const [k, link] of getDictionaryItems(links)) if (link) yield [k, requireLink(link, url, root, caller)];
}

/**
 * Merge two meta asset lists (modules, scripts, stylesheets), resolving the new hrefs to absolute URIs.
 *
 * - New assets are resolved relative to current URL (relative paths) and root URL (absolute paths).
 *
 * @param current The existing resolved assets.
 * @param next The new (possibly relative) assets to append.
 * @param url The current page URL, used to resolve relative hrefs.
 * @param root The root URL, used to resolve absolute hrefs.
 * @param caller Function to attribute thrown URL-resolution errors to (defaults to `mergeMetaAssets`).
 * @returns The combined resolved asset list, or `undefined` if there was nothing to merge.
 * @see https://shelving.cc/ui/mergeMetaAssets
 */
export function mergeMetaAssets(
	current: MetaAssets | undefined,
	next: PossibleMetaAssets | undefined,
	url: ImmutableURL | undefined,
	root: ImmutableURL | undefined,
	caller: AnyCaller = mergeMetaAssets,
): MetaAssets | undefined {
	if (next) {
		const mapped = _yieldMetaAssets(next, url, root, caller);
		return current ? [...current, ...mapped] : Array.from(mapped);
	}
	return current;
}
function* _yieldMetaAssets(
	assets: PossibleMetaAssets,
	url: ImmutableURL | undefined,
	root: ImmutableURL | undefined,
	caller: AnyCaller,
): Iterable<ImmutableURI> {
	for (const asset of assets) if (asset) yield requireLink(asset, url, root, caller);
}
