import type { ReactElement } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import "../style/base.css";
import type { PossibleMeta } from "../util/index.js";
import type { ChildProps } from "../util/props.js";

export interface AppProps extends PossibleMeta, ChildProps {}

/**
 * Root component for an application. Provides a `Meta` context to its children so descendants can read
 * or update metadata. Design tokens and body baseline typography are set globally via `style/base.css`.
 */
export function App({ children, ...meta }: AppProps): ReactElement {
	return <MetaContext value={requireMeta(meta)}>{children}</MetaContext>;
}
