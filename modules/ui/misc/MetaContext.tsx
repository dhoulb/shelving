import { createContext, use } from "react";
import type { AbsolutePath } from "../../util/path.js";
import { getURIParams, type URIParams } from "../../util/uri.js";
import { matchURLPrefix } from "../../util/url.js";
import { type Meta, mergeMeta, type PossibleMeta } from "../util/meta.js";
import type { ChildProps } from "../util/props.js";

/** Context to store the `Config` object. */
export const MetaContext = createContext<Meta>({});
MetaContext.displayName = "MetaContext";

export interface MetaProps extends PossibleMeta, ChildProps {}

/** Require the current meta context in a component. */
export function requireMeta(meta?: PossibleMeta): Meta {
	const current = use(MetaContext);
	return meta ? mergeMeta(current, meta) : current;
}

/** Get all URI/route params from the current meta context's URL. */
export function requireMetaParams(): URIParams {
	return getURIParams(requireMeta().url ?? {}, requireMetaParams);
}

/**
 * Get the current page's path relative to the site root.
 * - Strips the meta `root` (site base) prefix from the meta `url`, leaving a site-root-relative `AbsolutePath`.
 * - Returns `undefined` when `url` or `root` is unset, or they sit on different origins — the path is then unknowable.
 *
 * @returns The site-root-relative path (e.g. `/util/array`), or `undefined` if it can't be determined.
 */
export function getMetaPath(): AbsolutePath | undefined {
	const { url, root } = requireMeta();
	return matchURLPrefix(url, root, getMetaPath);
}
