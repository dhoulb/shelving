import type { ReactElement, ReactNode } from "react";
import { Meta } from "../misc/Meta.js";
import type { PossibleMetaData } from "../util/meta.js";
import APP_CSS from "./App.module.css";

export interface AppProps extends PossibleMetaData {
	children: ReactNode;
}

/**
 * Root component for an application.
 * - Sets up the top-level CSS variables (theme tokens) on `:root` via `App.module.css`.
 * - Provides a `Meta` context to its children so descendants can read or update meta data.
 */
export function App({ children, ...metadata }: AppProps): ReactElement {
	return (
		<Meta {...metadata}>
			<div className={APP_CSS.app}>{children}</div>
		</Meta>
	);
}
