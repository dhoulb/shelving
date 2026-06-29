import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import LINK_CSS from "./Link.module.css";

const LINK_CLASS = getModuleClass(LINK_CSS, "link");

/**
 * Props for `Link` — `ClickableProps` (`href` for navigation or `onClick` for actions) plus colour and typography variants.
 *
 * @see https://shelving.cc/ui/LinkProps
 */
export interface LinkProps extends ClickableProps, ColorVariants, TypographyVariants {}

/**
 * Inline link — delegates to `<Clickable>`, rendering an `<a>` (when `href` is set) or `<button>` (when `onClick` is set).
 *
 * @kind component
 * @see https://shelving.cc/ui/Link
 */
export function Link(props: LinkProps): ReactElement {
	return (
		<Clickable
			{...props}
			className={getClass(
				LINK_CLASS, //
				getColorClass(props),
				getTypographyClass(props),
			)}
		/>
	);
}
