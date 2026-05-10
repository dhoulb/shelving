import type { ReactElement, ReactNode } from "react";
import { requireMeta } from "../misc/Meta.js";

export interface HTMLProps {
	children: ReactNode;
}

/**
 * Output a `<html>` element wrapping `<body id="root">`.
 * - No `<head>` element is rendered. Head tags (`<title>`, `<meta>`, `<link>`, `<script>`) are emitted inline by `<Page>` / `<Head>` lower in the tree, and React 19 hoists them automatically — to the document `<head>` on the client, and to a generated `<head>` element during `renderToString` SSR.
 * - This means the same component tree works for both modes without any shell-aware logic.
 */
export function HTML({ children }: HTMLProps): ReactElement {
	const { language } = requireMeta();
	return (
		<html lang={language}>
			<body id="root">{children}</body>
		</html>
	);
}
