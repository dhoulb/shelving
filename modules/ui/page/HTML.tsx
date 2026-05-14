import type { ReactElement, ReactNode } from "react";
import { requireMeta } from "../misc/Meta.js";

export interface HTMLProps {
	children: ReactNode;
}

/**
 * Output a `<html>` element wrapping `<head>` (via `<Head>`) and `<body id="root">`.
 * - `<Head>` renders the literal `<head>` with `<base>` and other shell-level metadata; per-page hoistable elements (title, meta, links, stylesheets, scripts) come from `<PageHead>` inside `<Page>` and are hoisted into this `<head>` by React 19.
 */
export function HTML({ children }: HTMLProps): ReactElement {
	const { language, base, app } = requireMeta();
	return (
		<html lang={language}>
			<head>
				<meta charSet="utf-8" />
				{base && <base href={base.href} />}
				{app && <title>{app}</title>}
			</head>
			<body id="root">{children}</body>
		</html>
	);
}
