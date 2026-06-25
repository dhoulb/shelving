import type { ReactElement } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import type { ChildProps } from "../util/props.js";

/**
 * Props for `<HTML>` — initial `Meta` (language/root/app) plus the page `children`.
 *
 * @see https://shelving.cc/ui/HTMLProps
 */
export interface HTMLProps extends PossibleMeta, ChildProps {}

/**
 * Render the full `<html>` document shell wrapping `<head>` and `<body>`.
 * - Emits the literal `<head>` with `<base>` and other shell-level metadata; per-page hoistable elements (title, meta, links, stylesheets, scripts) come from `<Head>` inside `<Page>` and are hoisted into this `<head>` by React 19.
 *
 * @kind component
 * @see https://shelving.cc/ui/HTML
 */
export function HTML({ children, ...meta }: HTMLProps): ReactElement {
	const merged = requireMeta(meta);
	const { language, root, app } = merged;
	return (
		<html lang={language}>
			<head>
				<meta charSet="utf-8" />
				{root && <base href={root.href} />}
				{app && <title>{app}</title>}
			</head>
			<body>
				<MetaContext value={merged}>{children}</MetaContext>
			</body>
		</html>
	);
}
