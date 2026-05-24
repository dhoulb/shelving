import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { SURFACE_CLASS } from "../style/Surface.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import PANEL_CSS from "./Panel.module.css";

/** Allowed semantic elements for a `<Panel>`. */
export type PanelElement = "section" | "header" | "footer" | "nav" | "aside" | "article" | "div";

export interface PanelProps extends ColorVariants, TypographyVariants, OptionalChildProps {
	/** Underlying HTML element. Defaults to `<section>`. */
	as?: PanelElement | undefined;
	/** Status colour for the panel (e.g. `"error"`, `"success"`). */
	status?: Status | undefined;
}

/**
 * Full-width vertical region that paints the current surface colour. Use to break a page into stacked
 * sections — each `<Panel>` is a distinct surface tier, automatically darkening one step deeper when
 * nested inside another `.surface` element (via `SURFACE_CLASS`).
 *
 * Renders as a `<section>` by default; pass `as="header"` etc. for other semantic elements.
 *
 * @example <Panel><Block narrow><Title>Welcome</Title></Block></Panel>
 * @example <Panel as="header" primary><Title>Welcome</Title></Panel>
 */
export function Panel({ children, as = "section", status, ...props }: PanelProps): ReactElement {
	const Component = as;
	return (
		<Component
			className={getClass(
				SURFACE_CLASS, // Panel paints a surface — opt into the depth-tracking + auto-darkening chain.
				getModuleClass(PANEL_CSS, "panel"),
				status && getStatusClass(status),
				getColorClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</Component>
	);
}

export { PANEL_CSS };
