import type { ReactNode } from "react";
import { getModuleClass } from "../util/css.js";
import styles from "./Heading.module.css";

export interface HeadingProps {
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
	children: ReactNode;
}

export function Heading({ level = "1", children, ...variants }: HeadingProps) {
	const Element: `h${typeof level}` = `h${level}`;
	return <Element className={getModuleClass(styles, "heading", variants)}>{children}</Element>;
}
