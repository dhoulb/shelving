import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Preformatted.module.css";

export interface PreformattedProps extends OptionalChildProps {
	/** Wrap long lines instead of scrolling horizontally — renders content directly inside `<pre>` without a `<code>` wrapper. */
	wrap?: boolean | undefined;
}

/**
 * Preformatted block of text — rendered as `<pre>`.
 * - Defaults to a scrollable `<pre><code>` (matching Markdown's fenced-block output) so long lines scroll horizontally and preserve exact whitespace.
 * - Pass `wrap` to drop the `<code>` wrapper and let lines wrap (`white-space: pre-wrap`) — useful for prose-like blocks where horizontal scrolling would feel wrong.
 */
export function Preformatted({ children, ...variants }: PreformattedProps): ReactElement {
	return <pre className={getModuleClass(styles, "preformatted", variants)}>{variants.wrap ? children : <code>{children}</code>}</pre>;
}
