import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import HEADING_CSS from "./Heading.module.css";

const HEADING_CLASS = getModuleClass(HEADING_CSS, "heading");

/**
 * Props shared by [`<Title>`](/ui/Title), `Heading`, and [`<Subheading>`](/ui/Subheading) — colour, space, and typography variants plus a heading-level override.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Heading/HeadingProps
 */
export interface HeadingProps extends ColorVariants, SpaceVariants, TypographyVariants, ChildProps {
	/**
	 * Heading level (`1`–`6`) — sets the rendered `<h1>`–`<h6>` tag.
	 * Avoid overriding this in practice: pick the component that matches the level — [`<Title>`](/ui/Title) (`<h1>`), `Heading` (`<h2>`), or [`<Subheading>`](/ui/Subheading) (`<h3>`) — so the visual size and the document outline stay in step.
	 */
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Section heading — renders an `<h2>`.
 * - Sits between [`<Title>`](/ui/Title) (`<h1>`) and [`<Subheading>`](/ui/Subheading) (`<h3>`) in the heading hierarchy.
 *
 * @kind component
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
