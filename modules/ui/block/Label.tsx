import type { ReactElement } from "react";
import { getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import LABEL_CSS from "./Label.module.css";

const LABEL_CLASS = getModuleClass(LABEL_CSS, "label");

/**
 * Props for `Label` — identical to `HeadingProps`.
 *
 * @see https://shelving.cc/ui/LabelProps
 */
export interface LabelProps extends HeadingProps {}

/**
 * Label heading, a `<h3>` with a labelly appearance (UPPERCASE but with a smaller text size).
 * - This is the default style used by things like a `<th>` from a `<table>`.
 * - Default text properties for all of these can be controlled with global variables: `--size-label`, `--font-label`, `--case-label`.
 *
 * @kind component
 * @example <Label>Email address</Label>
 * @see https://shelving.cc/ui/Label
 */
export function Label({ level = "3", children, ...props }: LabelProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				LABEL_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</Element>
	);
}
