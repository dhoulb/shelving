import type { ReactElement } from "react";
import { type ColorProps, getColorClass } from "../style/Color.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getStatusClass, type StatusProps } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PANEL_CSS from "./Panel.module.css";

const PANEL_CLASS = getModuleClass(PANEL_CSS, "panel");
const PANEL_INNER_CLASS = getModuleClass(PANEL_CSS, "inner");

/** Allowed semantic elements for a `<Panel>`. */
export type PanelElement = "section" | "header" | "footer" | "nav" | "aside" | "article" | "div";

export interface PanelProps extends ColorProps, StatusProps, PaddingVariants, TypographyVariants, OptionalChildProps, WidthVariants {
	/** Underlying HTML element. Defaults to `<section>`. */
	as?: PanelElement | undefined;
}

/**
 * Full-width vertical region that paints the current surface colour. Use to break a page into stacked
 * sections. Has zero block-space (Panels butt against each other) but big vertical padding by
 * default — adjust with PaddingVariants (`<Panel padding-large>` etc.).
 *
 * Renders as a `<section>` by default; pass `as="header"` etc. for other semantic elements.
 *
 * @example <Panel><Block narrow><Title>Welcome</Title></Block></Panel>
 * @example <Panel as="header" primary><Title>Welcome</Title></Panel>
 */
export function Panel({ children, as = "section", ...props }: PanelProps): ReactElement {
	const Component = as;
	return (
		<Component
			className={getClass(PANEL_CLASS, getStatusClass(props), getColorClass(props), getPaddingClass(props), getTypographyClass(props))}
		>
			<div
				className={getClass(
					PANEL_INNER_CLASS, //
					getWidthClass(props),
				)}
			>
				{children}
			</div>
		</Component>
	);
}
