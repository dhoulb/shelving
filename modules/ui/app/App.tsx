import type { ReactElement } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
import type { PossibleMeta } from "../util/index.js";
import type { ChildProps } from "../util/props.js";

/**
 * Props for `<App>` — the root `Meta` plus the application `children`.
 *
 * @see https://shelving.cc/ui/AppProps
 */
export interface AppProps extends PossibleMeta, ChildProps {}

/**
 * Root component for an application, providing the top-level `Meta` context and global styles.
 * - Descendants can read or update metadata via the provided `<Meta>` context.
 * - Design tokens and body baseline typography are set globally via the `style/` token modules (`Color`, `Size`, `Font`, …).
 *
 * @param children The application content.
 * @param meta The root meta (app name, root URL, language, etc.).
 * @returns The app root element wrapping `children`.
 * @kind component
 * @example <App app="My App" root="https://example.com/"><Navigation>…</Navigation></App>
 * @see https://shelving.cc/ui/App
 */
export function App({ children, ...meta }: AppProps): ReactElement {
	return <MetaContext value={requireMeta(meta)}>{children}</MetaContext>;
}
