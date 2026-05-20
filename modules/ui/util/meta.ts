import type { ImmutableArray } from "../../util/array.js";
import { type DictionaryItem, getDictionaryItems, type ImmutableDictionary } from "../../util/dictionary.js";
import type { AnyCaller } from "../../util/function.js";
import { type PossibleLink, requireLink } from "../../util/link.js";
import type { Nullish } from "../../util/null.js";
import { type ImmutableURI, type PossibleURI, type PossibleURIParams, withURIParams } from "../../util/uri.js";
import { type ImmutableURL, type PossibleURL, requireURL } from "../../util/url.js";

/** Set of named meta `<meta />` tags in `{ name: content }` format. */
export type MetaTags = ImmutableDictionary<string | boolean | null | undefined>;

/** Set of named meta `<link />` tags in `{ rel: href }` format. */
export type MetaLinks = ImmutableDictionary<ImmutableURI>;

/** Set of named meta `<link />` tags in `{ rel: href }` format. */
export type PossibleMetaLinks = ImmutableDictionary<Nullish<PossibleLink>>;

/** Set of linked assets in `(href)[]` format. */
export type MetaAssets = ImmutableArray<ImmutableURI>;

/** Set of linked assets in `(href)[]` format. */
export type PossibleMetaAssets = ImmutableArray<Nullish<PossibleLink>>;

/** Type for a meta `Content-Security-Policy` tag in `{ resource: string[] }` format. */
export type MetaCSP = { readonly [resource: string]: string[] };

/** Combined meta data for a website page. */
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

/** Input metadata that can be parsed and converted to proper metadata. */
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

/** Turn a deconstructed CSP into a string. */
export function joinMetaCSP(csp: Nullish<MetaCSP>): string | undefined {
	if (typeof csp === "string") return csp;
	if (csp !== null && csp !== undefined) return Object.entries(csp).map(_mapCSP).join("; ");
}
const _mapCSP = ([key, content]: [string, string[]]) => `${key} ${content.join(" ")}`;

/** Merge two page or site titles together, e.g. `Manchester Runners` + `Messages` becomes `Messages - Manchester Runners` */
export function joinTitles(...titles: (string | undefined)[]): string {
	return titles.filter(Boolean).join(" - ");
}

/**
 * Merge two `MetaData` objects.
 * - `title` is merged.
 * - `URL` is resolved to an absolute URL, e.g. `./d/e/f` + `/a/b/c` becomes `https://d.com/a/b/c/d/e/f`
 * - `stylesheets` and `links` hrefs newly set in `meta2` are absolutified against the merged `url`/`base`, so they stay correct no matter where they are later rendered.
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
 * Resolve a `PossibleMeta` into a fully-formed `Meta`.
 * - Like `mergeMeta()` but with no previous `Meta` to merge into — initialises meta from scratch.
 */
export function getMeta(meta: PossibleMeta, caller: AnyCaller = getMeta): Meta {
	return mergeMeta({}, meta, caller);
}

/**
 * Merge two metadata URLs.
 * - New URL is resolved relative to: current URL, new base URL, current base URL
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
 * Merge two metadata tags.
 * - New assets are resolved relative to current URL (relative paths) and root URL (absolute paths).
 */
export function mergeMetaTags(current: MetaTags | undefined, next: MetaTags | undefined): MetaTags | undefined {
	return current && next ? { ...current, ...next } : current || next;
}

/**
 * Merge two metadata link lists.
 * - New assets are resolved relative to current URL (relative paths) and root URL (absolute paths).
 */
export function mergeMetaLinks(
	current: MetaLinks | undefined,
	next: PossibleMetaLinks | undefined,
	url: ImmutableURL | undefined,
	root: ImmutableURL | undefined,
	caller: AnyCaller = mergeMetaLinks,
): MetaLinks | undefined {
	return next ? { ...current, ..._yieldMetaLinkEntries(next, url, root, caller) } : current;
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
 * Merge two metadata asset lists.
 * - New assets are resolved relative to current URL (relative paths) and root URL (absolute paths).
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
