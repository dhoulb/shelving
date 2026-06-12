import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PREFORMATTED_CSS from "./Preformatted.module.css";

export const PREFORMATTED_CLASS = getModuleClass(PREFORMATTED_CSS, "preformatted");
export const PREFORMATTED_PROSE_CLASS = getModuleClass(PREFORMATTED_CSS, "prose");

export interface PreformattedProps
	extends SpaceVariants,
		ColorVariants,
		TypographyVariants,
		WidthVariants,
		PaddingVariants,
		OptionalChildProps {
	/** Enable line wrapping (default is nowrap). */
	wrap?: boolean | undefined;
}

/**
 * Preformatted block of text — rendered as `<pre>`.
 * - Lines are not wrapped by default — overflowing content scrolls horizontally within the block.
 * - Pass `wrap` to wrap long lines instead; newlines and indentation are preserved either way.
 */
export function Preformatted({ children, ...variants }: PreformattedProps): ReactElement {
	return (
		<pre
			className={getClass(
				getModuleClass(PREFORMATTED_CSS, "preformatted", variants), //
				getSpaceClass(variants),
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
