import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../button/Clickable.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import LINK_CSS from "./Link.module.css";

/**
 * Props for `Link` — `ClickableProps` (`href` for navigation or `onClick` for actions) plus colour and typography variants.
 *
 * @see https://shelving.cc/ui/LinkProps
 */
export interface LinkProps extends ClickableProps, TypographyVariants, ClassProps {
	/** Remove the link colour, weight, and underline, e.g. for a link around a block of content. */
	plain?: boolean | undefined;
}

/**
 * Inline link — delegates to `<Clickable>`, rendering an `<a>` (when `href` is set) or `<button>` (when `onClick` is set).
 *
 * @kind component
 * @see https://shelving.cc/ui/Link
 */
export function Link({ className, plain, ...props }: LinkProps): ReactElement {
	return (
		<Clickable
			{...props}
			className={getClass(
				getModuleClass(LINK_CSS, "link", { plain }), //
				getTypographyClass(props),
				className,
			)}
		/>
	);
}
