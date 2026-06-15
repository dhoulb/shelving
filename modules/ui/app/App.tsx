import type { ReactElement } from "react";
import { MetaContext, requireMeta } from "../misc/MetaContext.js";
// Load the global design tokens, cascade-layer order, and body baseline. Each module owns its own
// `:root` tokens (and body rules where relevant); see `modules/ui/README.md` for the styling system.
import "../style/layers.css";
import "../style/Color.module.css";
import "../style/Duration.module.css";
import "../style/Font.module.css";
import "../style/Radius.module.css";
import "../style/Shadow.module.css";
import "../style/Size.module.css";
import "../style/Space.module.css";
import "../style/Stroke.module.css";
import "../style/Tint.module.css";
import "../style/Weight.module.css";
import "../style/Width.module.css";
import type { PossibleMeta } from "../util/index.js";
import type { ChildProps } from "../util/props.js";

/**
 * Props for `<App>` — the root `Meta` plus the application `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/app/App/AppProps
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
 * @see https://dhoulb.github.io/shelving/ui/app/App/App
 */
export function App({ children, ...meta }: AppProps): ReactElement {
	return <MetaContext value={requireMeta(meta)}>{children}</MetaContext>;
}
