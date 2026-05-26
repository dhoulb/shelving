import type { ReactElement } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Heading.module.css";

/** Props shared by `Title`, `Heading`, and `Subheading`. */
export interface HeadingProps extends AlignVariants, ColorVariants, SpacingVariants, TypographyVariants, ChildProps {
	/**
	 * Heading level (`1`–`6`) — sets the rendered `<h1>`–`<h6>` tag.
	 * Avoid overriding this in practice: pick the component that matches the level — `Title` (`<h1>`), `Heading` (`<h2>`), or `Subheading` (`<h3>`) — so the visual size and the document outline stay in step.
	 */
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
	/** Status colour for the heading (e.g. `"error"`, `"success"`). Sets the variant scope; combine with a `text-X` typography variant to actually tint the text. */
	status?: Status | undefined;
}

/**
 * Section heading — renders an `<h2>`.
 * - Sits between `Title` (`<h1>`) and `Subheading` (`<h3>`) in the heading hierarchy.
 */
export function Heading({ level = "2", children, status, ...variants }: HeadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				getModuleClass(styles, "heading"),
				status && getStatusClass(status),
				getColorClass(variants),
				getAlignClass(variants),
				getSpacingClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</Element>
	);
}
