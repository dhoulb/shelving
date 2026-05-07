import { getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import styles from "./Subheading.module.css";

export type SubheadingProps = HeadingProps;

export function Subheading({ level = "2", children, ...variants }: SubheadingProps) {
	const Element: `h${typeof level}` = `h${level}`;
	return <Element className={getModuleClass(styles, "subheading", variants)}>{children}</Element>;
}
