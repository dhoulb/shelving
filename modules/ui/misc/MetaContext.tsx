import { createContext, use } from "react";
import { getURIParams, type URIParams } from "../../util/uri.js";
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
