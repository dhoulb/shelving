import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import type { BlockElement } from "./Block.js";
import PANEL_CSS from "./Panel.module.css";

const PANEL_CLASS = getModuleClass(PANEL_CSS, "panel");

/**
 * Props for `Panel` — colour, status, and typography variants plus optional `children`.
 *
 * @see https://shelving.cc/ui/PanelProps
 */
export interface PanelProps extends ColorVariants, PaddingVariants, StatusVariants, TypographyVariants, OptionalChildProps {
	/**
	 * Element this `<Panel>` renders as, e.g. "header" to output a "<header>"
	 * @default "section"
	 */
	as?: BlockElement | undefined;
}

/**
 * Full-width vertical region that paints the current surface colour. Use to break a page into stacked
 * sections. Has zero block-space (Panels butt against each other); set its vertical breathing room
 * with the `padding` variant (`<Panel padding="large">`, `<Panel padding="xxlarge">` etc.).
 *
 * Renders as a `<section>` by default; pass `as="header"` etc. for other semantic elements.
 *
 * @kind component
 * @returns Rendered full-width panel region.
 * @example <Panel><Block width="narrow"><Title>Welcome</Title></Block></Panel>
 * @example <Panel padding="xlarge" color="primary"><Title>Welcome</Title></Panel>
 * @see https://shelving.cc/ui/Panel
 */
export function Panel({ as: Element = "section", children, ...props }: PanelProps): ReactElement {
	return (
		<Element
			className={getClass(
				PANEL_CLASS, //
				getStatusClass(props),
				getColorClass(props),
				getPaddingClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Element>
	);
}
