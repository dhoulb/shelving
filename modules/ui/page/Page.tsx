import type { ReactElement, ReactNode } from "react";
import { Meta } from "../misc/Meta.js";
import type { PossibleMetaData } from "../util/meta.js";
import { Head } from "./Head.js";

export interface PageProps extends PossibleMetaData {
	children: ReactNode;
}

/**
 * Component for a single page (or screen) within an app.
 * - Changes the document title (that appears in the page tab) on render.
 */
export function Page({ children, ...metadata }: PageProps): ReactElement {
	return (
		<Meta {...metadata}>
			<Head />
			{children}
		</Meta>
	);
}
