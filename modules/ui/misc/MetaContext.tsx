import { createContext, use } from "react";
import { RequiredError } from "../../error/RequiredError.js";
import type { AnyCaller } from "../../util/function.js";
import type { AbsolutePath } from "../../util/path.js";
import { getURIParams, type URIParams } from "../../util/uri.js";
import { type ImmutableURL, matchURLPrefix } from "../../util/url.js";
import { type Meta, mergeMeta, type PossibleMeta } from "../util/meta.js";

/** Context to store the `Config` object. */
export const MetaContext = createContext<Meta>({});
MetaContext.displayName = "MetaContext";

/**
 * Use the current meta context in a component.
 *
 * @param meta A set of new possible meta data to combine into the current meta context.
 */
export function requireMeta(meta?: PossibleMeta): Meta {
	const current = use(MetaContext);
	return meta ? mergeMeta(current, meta) : current;
}

/** A `Meta` object with a defined `url` object, and `path` and `params` properties combined in. */
export interface MetaURL extends Meta {
	url: ImmutableURL;
	/** The path of `url` relative to `meta.root` (i.e. the _site-root-relative_ path). */
	path: AbsolutePath;
	/** The `?query` params of `url` extracted as a flat set of parameters. */
	params: URIParams;
}

/**
 * Use the current meta context in a component with some additional URL helpers.
 *
 * @param meta A set of new possible meta data to combine into the current meta context.
 * @returns A `Meta` object with a defined `url` object, and `path` and `params` properties combined in.
 * @throws {RequiredError} if the current meta has no `url`
 * @throws {RequiredError} if the current meta `url` does not match the origin of the current meta `root`
 */
export function requireMetaURL(meta?: PossibleMeta, caller: AnyCaller = requireMetaURL): MetaURL {
	const { url, root, ...combined } = requireMeta(meta);
	if (!url) throw new RequiredError("Meta URL is required", { received: url, caller });
	const path = matchURLPrefix(url, root, caller);
	if (!path) throw new RequiredError("Meta URL and meta root must share an origin", { url, root, caller });
	const params = getURIParams(url, caller);
	return { ...combined, url, root, path, params };
}
