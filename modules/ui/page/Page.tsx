import type { ReactElement, ReactNode } from "react";
import { Meta } from "../misc/Meta.js";
import type { PossibleMeta } from "../util/meta.js";
import { Head } from "./Head.js";
import { HTML } from "./HTML.js";

export interface PageProps extends PossibleMeta {
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

/**
 * Page that outputs an entire `<html>` element.
 */
export function HTMLPage({ children, ...metadata }: PageProps): ReactElement {
	return (
		<Meta {...metadata}>
			<HTML>{children}</HTML>
		</Meta>
	);
}
