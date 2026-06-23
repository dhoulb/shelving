import type { ReactElement } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import type { ChildProps } from "../util/props.js";
import { Head } from "./Head.js";

/**
 * Props for `<Page>` — per-page `Meta` (title, description, etc.) plus the page `children`.
 *
 * @see https://shelving.cc/ui/PageProps
 */
export interface PageProps extends PossibleMeta, ChildProps {}

/**
 * Wrap a single page (or screen) within an app, applying its meta and head tags.
 * - Sets the document title and other head metadata via `<Head>`, which emits hoistable tags inline; React 19 hoists each one into the document `<head>`. `<base>` is not emitted here — it lives in the `<HTML>` shell's `<Head>`.
 * - Also updates `window.history` to match the page URL.
 *
 * @kind component
 * @param children The page content.
 * @param meta Per-page meta (title, description, etc.) merged with the surrounding `<Meta>` context.
 * @returns The page element with its meta applied.
 * @example <Page title="Settings"><SettingsForm /></Page>
 * @see https://shelving.cc/ui/Page
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
