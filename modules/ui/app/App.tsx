import { type ReactElement, type ReactNode, useEffect } from "react";
import { Meta } from "../misc/Meta.js";
import type { PossibleMetaData } from "../util/meta.js";
import APP_CSS from "./App.module.css";

export interface AppProps extends PossibleMetaData {
	children: ReactNode;
}

/**
 * Root component for an application.
 * - Adds the theme CSS class (which sets CSS token variables on `:root`) to `document.body` on mount and removes it on unmount.
 * - Provides a `Meta` context to its children so descendants can read or update metadata.
 */
export function App({ children, ...metadata }: AppProps): ReactElement {
	useEffect(() => {
		document.body.classList.add(APP_CSS.app!);
		return () => {
			document.body.classList.remove(APP_CSS.app!);
		};
	}, []);
	return <Meta {...metadata}>{children}</Meta>;
}
