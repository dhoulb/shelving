import type { ReactElement } from "react";
import { getAlignClass } from "../style/Align.js";
import { getColorClass } from "../style/Color.js";
import { getSpacingClass } from "../style/Spacing.js";
import { getStatusClass } from "../style/Status.js";
import { getTypographyClass } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import styles from "./Title.module.css";

/** Props for `Title` — identical to `HeadingProps`. */
export type TitleProps = HeadingProps;

/**
 * Page title — renders an `<h1>`.
 * - The most prominent heading on a page; there should normally be exactly one.
 */
export function Title({ level = "1", children, status, ...variants }: TitleProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				getModuleClass(styles, "title"),
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
