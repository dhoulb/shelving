import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import styles from "./Subheading.module.css";

/** Props for `Subheading` — identical to `HeadingProps`. */
export type SubheadingProps = HeadingProps;

/**
 * Subsection heading — renders an `<h3>`.
 * - Only marginally larger than body text; its bold weight is the main differentiator.
 */
export function Subheading({ level = "3", children, ...variants }: SubheadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return <Element className={getModuleClass(styles, "subheading", variants)}>{children}</Element>;
}
