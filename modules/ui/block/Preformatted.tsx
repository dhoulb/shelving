import type { ReactElement } from "react";
import { SURFACE_CLASS } from "../misc/Surface.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Preformatted.module.css";

export interface PreformattedProps extends OptionalChildProps {
	/** Disable line wrapping — long lines overflow horizontally instead of wrapping. */
	nowrap?: boolean | undefined;
}

/**
 * Preformatted block of text — rendered as `<pre>`.
 * - Defaults to wrapping long lines (`white-space: pre-wrap`) so code fits the container width while preserving newlines and indentation within wrapped lines.
 * - Pass `nowrap` to restore strict `<pre>` behaviour when exact whitespace matters (ASCII art, fixed-column tables). Wrap in a `<Figure scrollable>` (or any `scrollable` block) to add horizontal scrolling.
 */
export function Preformatted({ children, ...variants }: PreformattedProps): ReactElement {
	return <pre className={getClass(SURFACE_CLASS, getModuleClass(styles, "preformatted", variants))}>{children}</pre>;
}
