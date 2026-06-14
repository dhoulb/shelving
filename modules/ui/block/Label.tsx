import type { ReactElement } from "react";
import { getColorClass } from "../style/Color.js";
import { getSpaceClass } from "../style/Space.js";
import { getTypographyClass } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import LABEL_CSS from "./Label.module.css";
import type { SubheadingProps } from "./Subheading.js";

/**
 * CSS class applied to the root element of every `Label`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Label/LABEL_CLASS
 */
export const LABEL_CLASS = getModuleClass(LABEL_CSS, "label");

/**
 * Props for `Label` — identical to `SubheadingProps`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Label/LabelProps
 */
export interface LabelProps extends SubheadingProps {}

/**
 * Label heading, a `<h3>` with a labelly appearance (UPPERCASE but with a smaller text size).
 * - This is the default style used by things like a `<th>` from a `<table>`.
 * - Default text properties for all of these can be controlled with global variables: `--size-label`, `--font-label`, `--case-label`.
 *
 * @param props Colour, space, and typography variants plus an optional `level` override and `children`.
 * @returns Rendered `<h3>` label heading element.
 * @example <Label>Email address</Label>
 * @see https://dhoulb.github.io/shelving/ui/block/Label/Label
 */
export function Label({ level = "3", children, ...props }: LabelProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				LABEL_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Element>
	);
}
