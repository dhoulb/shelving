import type { ReactElement, ReactNode } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import { Head } from "./Head.js";

export interface PageProps extends PossibleMeta {
	children: ReactNode;
}

/**
 * Component for a single page (or screen) within an app.
 * - Sets the document title and other head metadata via `<Head>`, which emits hoistable tags inline; React 19 hoists each one into the document `<head>`. `<base>` is not emitted here — it lives in the `<HTML>` shell's `<Head>`.
 * - Also updates `window.history` to match the page URL.
 */
export function Page({ children, ...meta }: PageProps): ReactElement {
	const merged = requireMeta(meta);
	return (
		<MetaContext value={merged}>
			<Head />
			{children}
		</MetaContext>
	);
}
