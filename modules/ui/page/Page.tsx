import { type ReactElement, use } from "react";
import { MetaContext } from "../misc/MetaContext.js";
import { mergeMeta, type PossibleMeta } from "../util/meta.js";
import type { ChildProps } from "../util/props.js";
import { setMetaDepth } from "./depth.js";
import { Head } from "./Head.js";

/**
 * Props for `<Page>` — per-page `Meta` (title, description, etc.) plus the page `children`.
 *
 * @see https://shelving.cc/ui/PageProps
 */
export interface PageProps extends PossibleMeta, ChildProps {}

/**
 * Wrap a single page (or screen) within an app, applying its meta and head tags.
 * - Sets the document title and other head metadata via `<Head>`. On the server it emits hoistable tags inline, and React 19 hoists each one into the document `<head>`. In the browser it sets only the title (the deepest `<Page>` wins). `<base>` is not emitted here — it lives in the `<HTML>` shell's `<Head>`.
 * - Also updates `window.history` to match the page URL.
 *
 * @kind component
 * @see https://shelving.cc/ui/Page
 */
export function Page({ children, ...meta }: PageProps): ReactElement {
	const parent = use(MetaContext);
	const merged = mergeMeta(parent, meta);
	setMetaDepth(merged, parent);
	return (
		<MetaContext value={merged}>
			<Head />
			{children}
		</MetaContext>
	);
}
