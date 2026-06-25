import type { ReactElement } from "react";
import { getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import TITLE_CSS from "./Title.module.css";

const TITLE_CLASS = getModuleClass(TITLE_CSS, "title");

/**
 * Props for `Title` — identical to `HeadingProps`.
 *
 * @see https://shelving.cc/ui/TitleProps
 */
export type TitleProps = HeadingProps;

/**
 * Page title — renders an `<h1>`.
 * - The most prominent heading on a page; there should normally be exactly one.
 *
 * @kind component
 * @see https://shelving.cc/ui/Title
 */
export function Title({ level = "1", children, ...props }: TitleProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				TITLE_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</Element>
	);
}
