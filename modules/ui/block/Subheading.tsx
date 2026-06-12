import type { ReactElement } from "react";
import { getColorClass } from "../style/Color.js";
import { getSpaceClass } from "../style/Space.js";
import { getTypographyClass } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import SUBHEADING_CSS from "./Subheading.module.css";

export const SUBHEADING_CLASS = getModuleClass(SUBHEADING_CSS, "subheading");
export const SUBHEADING_PROSE_CLASS = getModuleClass(SUBHEADING_CSS, "prose");

/** Props for `Subheading` — identical to `HeadingProps`. */
export type SubheadingProps = HeadingProps;

/**
 * Subsection heading — renders an `<h3>`.
 * - Only marginally larger than body text; its bold weight is the main differentiator.
 */
export function Subheading({ level = "3", children, ...props }: SubheadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				SUBHEADING_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Element>
	);
}
