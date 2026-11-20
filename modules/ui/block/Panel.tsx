import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getPaddingClass, type PaddingVariants } from "../style/Padding.js";
import { getStatusClass, type StatusVariants } from "../style/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import type { BlockElement } from "./Block.js";
import PANEL_CSS from "./Panel.module.css";

const PANEL_CLASS = getModuleClass(PANEL_CSS, "panel");
const PANEL_PLAIN_CLASS = getModuleClass(PANEL_CSS, "plain");
const PANEL_SOLID_CLASS = getModuleClass(PANEL_CSS, "solid");

/**
 * Props for `Panel` — colour, status, and typography variants plus optional `children`.
 *
 * @see https://shelving.cc/ui/PanelProps
 */
export interface PanelProps extends BlockVariants, PaddingVariants, StatusVariants, OptionalChildProps, ClassProps {
	/**
	 * Element this `<Panel>` renders as, e.g. "header" to output a "<header>"
	 * @default "section"
	 */
	as?: BlockElement | undefined;
	/** Remove the background, but keep the spacing. `color=` and `status=` still tint the content. */
	plain?: boolean | undefined;
	/** Paint a strong fill (`--tint-50`) with light text, for example for a hero or call-to-action band. */
	solid?: boolean | undefined;
}

/**
 * Full-width vertical region that paints the current surface colour. Use to break a page into stacked
 * sections. Has zero block-space (Panels butt against each other); set its vertical breathing room
 * with the `padding` variant (`<Panel padding="large">`, `<Panel padding="xxlarge">` etc.).
 *
 * Renders as a `<section>` by default; pass `as="header"` etc. for other semantic elements.
 * Set `plain` to remove the background, or `solid` for a strong fill.
 *
 * @kind component
 * @see https://shelving.cc/ui/Panel
 */
export function Panel({ as: Element = "section", plain, solid, children, className, ...props }: PanelProps): ReactElement {
	return (
		<Element
			className={getClass(
				PANEL_CLASS, //
				plain && PANEL_PLAIN_CLASS,
				solid && PANEL_SOLID_CLASS,
				getStatusClass(props),
				getPaddingClass(props),
				getBlockClass({ ...props, trim: props.trim ?? true }),
				className,
			)}
		>
			{children}
		</Element>
	);
}
