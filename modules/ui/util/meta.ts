import type { ImmutableArray } from "../../util/array.js";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import type { AnyCaller } from "../../util/function.js";
import type { Nullish } from "../../util/null.js";
import { type PossibleURIParams, withURIParams } from "../../util/uri.js";
import { type ImmutableURL, type PossibleURL, requireURL } from "../../util/url.js";

/** Set of named meta `<meta />` tags in `{ rel: href }` format. */
export type MetaTags = ImmutableDictionary<Nullish<string | boolean>>;

/** Set of named meta `<link />` tags in `{ rel: href }` format. */
export type MetaLinks = ImmutableDictionary<Nullish<string>>;

/** Set of linked assets in `(href)[]` format. */
export type MetaAssets = ImmutableArray<Nullish<string>>;

/** Type for a meta `Content-Security-Policy` tag in `{ resource: string[] }` format. */
export type MetaCSP = { readonly [resource: string]: string[] };

/** Combined meta data for a website page. */
export interface Meta {
	/** Base URL for the app (used to resolve `url` and set as `<base>` tag in `<Head>`). */
	readonly base?: ImmutableURL | undefined;
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
	readonly csp?: MetaCSP | undefined;
	readonly tags?: MetaTags | undefined;
	readonly links?: MetaLinks | undefined;
	readonly modules?: MetaAssets | undefined;
	readonly scripts?: MetaAssets | undefined;
	readonly stylesheets?: MetaAssets | undefined;
}

/** Input metadata that can be parsed and converted to proper metadata. */
export interface PossibleMeta extends Omit<Meta, "url"> {
	/**
	 * New URL for the page.
	 * - Resolved using `requireURL()` if set relative to `base`
	 */
	readonly url?: PossibleURL | undefined;
	/**
	 * Set the params in the URL (not merged with existing params).
	 * - Added to `url` after it is resolved.
	 * - Baseically
	 */
	readonly params?: PossibleURIParams | undefined;
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
 */
export function mergeMeta(meta1: Meta, meta2: PossibleMeta, caller: AnyCaller = mergeMeta): Meta {
	const title = joinTitles(meta2.title, meta1.title);

	const base = mergeMetaURL(undefined, meta1.base, meta2.base, undefined, caller);
	const url = mergeMetaURL(base, meta1.url, meta2.url, meta2.params, caller);

	return { ...meta1, ...meta2, base, url, title };
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
