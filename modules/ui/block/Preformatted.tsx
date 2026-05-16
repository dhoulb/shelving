import type { ReactElement, ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./Preformatted.module.css";

export interface PreformattedProps {
	children?: ReactNode;
	/** Disable line wrapping — long lines overflow horizontally instead of wrapping. */
	nowrap?: boolean | undefined;
}

/**
 * Preformatted block of text — rendered as `<pre>`.
 * - Defaults to wrapping long lines (`white-space: pre-wrap`) so code fits the container width while preserving newlines and indentation within wrapped lines.
 * - Pass `nowrap` to restore strict `<pre>` behaviour when exact whitespace matters (ASCII art, fixed-column tables).
 */
export function Preformatted({ children, ...variants }: PreformattedProps): ReactElement {
	return <pre className={getModuleClass(styles, "preformatted", variants)}>{children}</pre>;
}
