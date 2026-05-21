import { type ReactElement, useEffect } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import type { ChildProps } from "../util/props.js";
import APP_CSS from "./App.module.css";

export interface AppProps extends PossibleMeta, ChildProps {}

const APP_CLASS = APP_CSS.app;

/**
 * Root component for an application.
 * - Adds the theme CSS class (which sets CSS token variables on `:root`) to `document.body` on mount and removes it on unmount.
 * - Provides a `Meta` context to its children so descendants can read or update metadata.
 */
export function App({ children, ...meta }: AppProps): ReactElement {
	const merged = requireMeta(meta);
	useEffect(() => {
		if (!APP_CLASS) return;
		document.body.classList.add(APP_CLASS);
		return () => document.body.classList.remove(APP_CLASS);
	}, []);
	return <MetaContext value={merged}>{children}</MetaContext>;
}
