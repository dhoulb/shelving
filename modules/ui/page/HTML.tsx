import type { ReactElement, ReactNode } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";

export interface HTMLProps extends PossibleMeta {
	children: ReactNode;
}

/**
 * Output a `<html>` element wrapping `<head>` (via `<Head>`) and `<body>`.
 * - `<Head>` renders the literal `<head>` with `<base>` and other shell-level metadata; per-page hoistable elements (title, meta, links, stylesheets, scripts) come from `<PageHead>` inside `<Page>` and are hoisted into this `<head>` by React 19.
 */
export function HTML({ children, ...meta }: HTMLProps): ReactElement {
	const merged = requireMeta(meta);
	const { language, root: base, app } = merged;
	return (
		<html lang={language}>
			<head>
				<meta charSet="utf-8" />
				{base && <base href={base.href} />}
				{app && <title>{app}</title>}
			</head>
			<body>
				<MetaContext value={merged}>{children}</MetaContext>
			</body>
		</html>
	);
}
