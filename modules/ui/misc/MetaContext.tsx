import { createContext, use } from "react";
import { RequiredError } from "../../error/RequiredError.js";
import type { AnyCaller } from "../../util/function.js";
import type { AbsolutePath } from "../../util/path.js";
import { getURIParams, type URIParams } from "../../util/uri.js";
import { type ImmutableURL, matchURLPrefix } from "../../util/url.js";
import { type Meta, mergeMeta, type PossibleMeta } from "../util/meta.js";

/**
 * React context holding the current `Meta` object (page URL, site root, title, etc.).
 *
 * @example <MetaContext value={meta}>…</MetaContext>
 * @see https://dhoulb.github.io/shelving/ui/misc/MetaContext/MetaContext
 */
export const MetaContext = createContext<Meta>({});
MetaContext.displayName = "MetaContext";

/**
 * Read the current `Meta` context, optionally merging in additional meta data.
 *
 * - Must be called inside a component or hook (reads context via React's `use()`).
 *
 * @param meta A set of new possible meta data to combine into the current meta context.
 * @returns The current `Meta`, with `meta` merged in when provided.
 * @example const { title, url } = requireMeta();
 * @see https://dhoulb.github.io/shelving/ui/misc/MetaContext/requireMeta
 */
export function requireMeta(meta?: PossibleMeta): Meta {
	const current = use(MetaContext);
	return meta ? mergeMeta(current, meta) : current;
}

/**
 * A `Meta` object with a guaranteed `url`, plus derived `path` and `params` properties.
 *
 * @see https://dhoulb.github.io/shelving/ui/misc/MetaContext/MetaURL
 */
export interface MetaURL extends Meta {
	url: ImmutableURL;
	/** The path of `url` relative to `meta.root` (i.e. the _site-root-relative_ path). */
	path: AbsolutePath;
	/** The `?query` params of `url` extracted as a flat set of parameters. */
	params: URIParams;
}

/**
 * Read the current `Meta` context and derive URL helpers (`path` and `params`) from its `url`.
 *
 * @param meta A set of new possible meta data to combine into the current meta context.
 * @param caller Function to attribute thrown `RequiredError`s to (defaults to `requireMetaURL`).
 * @returns A `Meta` object with a defined `url`, plus `path` and `params` properties combined in.
 * @throws RequiredError If the current meta has no `url`.
 * @throws RequiredError If the current meta `url` does not share an origin with the meta `root`.
 * @example const { path, params } = requireMetaURL();
 * @see https://dhoulb.github.io/shelving/ui/misc/MetaContext/requireMetaURL
 */
export function requireMetaURL(meta?: PossibleMeta, caller: AnyCaller = requireMetaURL): MetaURL {
	const { url, root, ...combined } = requireMeta(meta);
	if (!url) throw new RequiredError("Meta URL is required", { received: url, caller });
	const path = matchURLPrefix(url, root, caller);
	if (!path) throw new RequiredError("Meta URL and meta root must share an origin", { url, root, caller });
	const params = getURIParams(url, caller);
	return { ...combined, url, root, path, params };
}
