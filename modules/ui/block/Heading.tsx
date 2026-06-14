import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import HEADING_CSS from "./Heading.module.css";

/**
 * CSS class applied to the root element of every `Heading`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Heading/HEADING_CLASS
 */
export const HEADING_CLASS = getModuleClass(HEADING_CSS, "heading");

/**
 * CSS class that styles a `Heading` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Heading/HEADING_PROSE_CLASS
 */
export const HEADING_PROSE_CLASS = getModuleClass(HEADING_CSS, "prose");

/**
 * Props shared by `Title`, `Heading`, and `Subheading` — colour, space, and typography variants plus a heading-level override.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Heading/HeadingProps
 */
export interface HeadingProps extends ColorVariants, SpaceVariants, TypographyVariants, ChildProps {
	/**
	 * Heading level (`1`–`6`) — sets the rendered `<h1>`–`<h6>` tag.
	 * Avoid overriding this in practice: pick the component that matches the level — `Title` (`<h1>`), `Heading` (`<h2>`), or `Subheading` (`<h3>`) — so the visual size and the document outline stay in step.
	 */
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Section heading — renders an `<h2>`.
 * - Sits between `Title` (`<h1>`) and `Subheading` (`<h3>`) in the heading hierarchy.
 *
 * @param props Colour, space, and typography variants plus an optional `level` override and `children`.
 * @returns Rendered `<h2>` heading element.
 * @example <Heading>Section title</Heading>
 * @see https://dhoulb.github.io/shelving/ui/block/Heading/Heading
 */
export function Heading({ level = "2", children, ...props }: HeadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				HEADING_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Element>
	);
}
