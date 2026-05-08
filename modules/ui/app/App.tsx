import { type ReactElement, type ReactNode, useEffect } from "react";
import { Meta } from "../misc/Meta.js";
import type { PossibleMeta } from "../util/meta.js";
import APP_CSS from "./App.module.css";

export interface AppProps extends PossibleMeta {
	children: ReactNode;
}

const APP_CLASS = APP_CSS.app;

/**
 * Root component for an application.
 * - Adds the theme CSS class (which sets CSS token variables on `:root`) to `document.body` on mount and removes it on unmount.
 * - Provides a `Meta` context to its children so descendants can read or update metadata.
 */
export function App({ children, ...metadata }: AppProps): ReactElement {
	useEffect(() => {
		if (!APP_CLASS) return;
		document.body.classList.add(APP_CLASS);
		return () => document.body.classList.remove(APP_CLASS);
	}, []);
	return <Meta {...metadata}>{children}</Meta>;
}
