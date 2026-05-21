import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import styles from "./Title.module.css";

/** Props for `Title` — identical to `HeadingProps`. */
export type TitleProps = HeadingProps;

/**
 * Page title — renders an `<h1>`.
 * - The most prominent heading on a page; there should normally be exactly one.
 */
export function Title({ level = "1", children, ...variants }: TitleProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return <Element className={getModuleClass(styles, "title", variants)}>{children}</Element>;
}
