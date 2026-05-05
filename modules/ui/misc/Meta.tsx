import { createContext, type ReactNode, use } from "react";
import { type MetaData, mergeMeta, type PossibleMetaData } from "../util/meta.js";

/** Context to store the `Config` object. */
const _MetaContext = createContext<MetaData>({});
_MetaContext.displayName = "MetaContext";

export interface MetaProps extends PossibleMetaData {
	children: ReactNode;
}

/** Create or update the current meta context. */
export function Meta({ children, ...meta }: MetaProps) {
	return <_MetaContext value={mergeMeta(use(_MetaContext), meta)}>{children}</_MetaContext>;
}

/** Require the current meta context in a component. */
export function requireMeta(): MetaData {
	return use(_MetaContext);
}
