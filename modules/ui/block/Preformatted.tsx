import type { ReactElement } from "react";
import { type ColorProps, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PREFORMATTED_CSS from "./Preformatted.module.css";

export const PREFORMATTED_CLASS = getModuleClass(PREFORMATTED_CSS, "preformatted");
export const PREFORMATTED_PROSE_CLASS = getModuleClass(PREFORMATTED_CSS, "prose");

export interface PreformattedProps
	extends SpacingVariants,
		ColorProps,
		TypographyVariants,
		WidthVariants,
		PaddingVariants,
		OptionalChildProps {
	/** Enable line wrapping (default is nowrap). */
	wrap?: boolean | undefined;
}

/**
 * Preformatted block of text — rendered as `<pre>`.
 * - Defaults to wrapping long lines (`white-space: pre-wrap`) so code fits the container width while preserving newlines and indentation within wrapped lines.
 * - Pass `nowrap` to restore strict `<pre>` behaviour when exact whitespace matters (ASCII art, fixed-column tables). Wrap in a `<Figure scrollable>` (or any `scrollable` block) to add horizontal scrolling.
 */
export function Preformatted({ children, ...variants }: PreformattedProps): ReactElement {
	return (
		<pre
			className={getClass(
				getModuleClass(PREFORMATTED_CSS, "preformatted", variants), //
				getSpacingClass(variants),
				getColorClass(variants),
				getTypographyClass(variants),
				getPaddingClass(variants),
				getWidthClass(variants),
			)}
		>
			{children}
		</pre>
	);
}
