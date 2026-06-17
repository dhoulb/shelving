import type { ReactElement } from "react";
import { getColorClass } from "../style/Color.js";
import { getSpaceClass } from "../style/Space.js";
import { getTypographyClass } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { HeadingProps } from "./Heading.js";
import SUBHEADING_CSS from "./Subheading.module.css";

const SUBHEADING_CLASS = getModuleClass(SUBHEADING_CSS, "subheading");

/**
 * Props for `Subheading` — identical to [`HeadingProps`](/ui/HeadingProps).
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Subheading/SubheadingProps
 */
export type SubheadingProps = HeadingProps;

/**
 * Subsection heading — renders an `<h3>`.
 * - Only marginally larger than body text; its bold weight is the main differentiator.
 *
 * @kind component
 * @returns Rendered `<h3>` heading element.
 * @example <Subheading>Details</Subheading>
 * @see https://dhoulb.github.io/shelving/ui/block/Subheading/Subheading
 */
export function Subheading({ level = "3", children, ...props }: SubheadingProps): ReactElement {
	const Element: `h${typeof level}` = `h${level}`;
	return (
		<Element
			className={getClass(
				SUBHEADING_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Element>
	);
}
