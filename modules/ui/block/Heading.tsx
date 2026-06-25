import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import HEADING_CSS from "./Heading.module.css";

const HEADING_CLASS = getModuleClass(HEADING_CSS, "heading");

/**
 * Props shared by `<Title>`, `Heading`, and `<Subheading>` — colour, space, and typography variants plus a heading-level override.
 *
 * @see https://shelving.cc/ui/HeadingProps
 */
export interface HeadingProps extends BlockVariants, ChildProps {
	/**
	 * Heading level (`1`–`6`) — sets the rendered `<h1>`–`<h6>` tag.
	 * Avoid overriding this in practice: pick the component that matches the level — `<Title>` (`<h1>`), `Heading` (`<h2>`), or `<Subheading>` (`<h3>`) — so the visual size and the document outline stay in step.
	 */
	level?: "1" | "2" | "3" | "4" | "5" | "6" | 1 | 2 | 3 | 4 | 5 | 6;
}

/**
 * Section heading — renders an `<h2>`.
 * - Sits between `<Title>` (`<h1>`) and `<Subheading>` (`<h3>`) in the heading hierarchy.
 *
 * @kind component
 * @see https://shelving.cc/ui/Heading
 */
export function Heading({ level = "2", children, ...props }: HeadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				HEADING_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</Element>
	);
}
