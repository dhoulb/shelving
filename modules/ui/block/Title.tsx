import type { ReactElement } from "react";
import { getColorClass } from "../style/Color.js";
import { getSpaceClass } from "../style/Space.js";
import { getTypographyClass } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import TITLE_CSS from "./Title.module.css";

/**
 * CSS class applied to the root element of every `Title`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Title/TITLE_CLASS
 */
export const TITLE_CLASS = getModuleClass(TITLE_CSS, "title");

/**
 * CSS class that styles a `Title` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Title/TITLE_PROSE_CLASS
 */
export const TITLE_PROSE_CLASS = getModuleClass(TITLE_CSS, "prose");

/**
 * Props for `Title` — identical to `HeadingProps`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Title/TitleProps
 */
export type TitleProps = HeadingProps;

/**
 * Page title — renders an `<h1>`.
 * - The most prominent heading on a page; there should normally be exactly one.
 *
 * @param props Colour, space, and typography variants plus an optional `level` override and `children`.
 * @returns Rendered `<h1>` heading element.
 * @example <Title>Welcome</Title>
 * @see https://dhoulb.github.io/shelving/ui/block/Title/Title
 */
export function Title({ level = "1", children, ...props }: TitleProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				TITLE_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Element>
	);
}
