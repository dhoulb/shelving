import type { ReactElement, ReactNode } from "react";
import { Meta } from "../misc/Meta.js";
import type { PossibleMeta } from "../util/meta.js";
import { Head } from "./Head.js";

export interface PageProps extends PossibleMeta {
	children: ReactNode;
}

/**
 * Component for a single page (or screen) within an app.
 * - Sets the document title and other head metadata.
 * - `<Head />` renders `<title>` / `<meta>` / `<link>` tags inline; React 19 hoists them automatically to the document `<head>` (or to `document.head` on the client). Works for both client-mounted SPAs and `renderToString` SSR.
 */
export function Page({ children, ...metadata }: PageProps): ReactElement {
	return (
		<Meta {...metadata}>
			<Head />
			{children}
		</Meta>
	);
}
