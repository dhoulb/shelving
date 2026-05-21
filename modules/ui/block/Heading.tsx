import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import styles from "./Heading.module.css";

/** Props shared by `Title`, `Heading`, and `Subheading`. */
export interface HeadingProps extends ChildProps {
	/**
	 * Heading level (`1`–`6`) — sets the rendered `<h1>`–`<h6>` tag.
	 * Avoid overriding this in practice: pick the component that matches the level — `Title` (`<h1>`), `Heading` (`<h2>`), or `Subheading` (`<h3>`) — so the visual size and the document outline stay in step.
	 */
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Section heading — renders an `<h2>`.
 * - Sits between `Title` (`<h1>`) and `Subheading` (`<h3>`) in the heading hierarchy.
 */
export function Heading({ level = "2", children, ...variants }: HeadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return <Element className={getModuleClass(styles, "heading", variants)}>{children}</Element>;
}
