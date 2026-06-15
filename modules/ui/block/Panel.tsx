import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PANEL_CSS from "./Panel.module.css";

const PANEL_CLASS = getModuleClass(PANEL_CSS, "panel");

/**
 * Allowed semantic elements for a `<Panel>`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Panel/PanelElement
 */
export type PanelElement = "section" | "header" | "footer" | "nav" | "aside" | "article" | "div";

/**
 * Props for `Panel` — colour, status, and typography variants plus optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Panel/PanelProps
 */
export interface PanelProps extends ColorVariants, PaddingVariants, StatusVariants, TypographyVariants, OptionalChildProps {}

/**
 * Full-width vertical region that paints the current surface colour. Use to break a page into stacked
 * sections. Has zero block-space (Panels butt against each other); set its vertical breathing room
 * with the `padding` variant (`<Panel padding="large">`, `<Panel padding="xxlarge">` etc.).
 *
 * Renders as a `<section>` by default; pass `as="header"` etc. for other semantic elements.
 *
 * @kind component
 * @param props Colour, padding, status, and typography variants plus `children`.
 * @returns Rendered full-width panel region.
 * @example <Panel><Block width="narrow"><Title>Welcome</Title></Block></Panel>
 * @example <Panel padding="xlarge" color="primary"><Title>Welcome</Title></Panel>
 * @see https://dhoulb.github.io/shelving/ui/block/Panel/Panel
 */
export function Panel({ children, ...props }: PanelProps): ReactElement {
	return (
		<div
			className={getClass(
				PANEL_CLASS, //
				getStatusClass(props),
				getColorClass(props),
				getPaddingClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</div>
	);
}
