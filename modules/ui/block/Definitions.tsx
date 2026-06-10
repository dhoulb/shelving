import type { ReactElement } from "react";
import { type ColorProps, getColorClass } from "../style/Color.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import DEFINITIONS_CSS from "./Definitions.module.css";

export const DEFINITIONS_CLASS = getModuleClass(DEFINITIONS_CSS, "definitions");
export const DEFINITIONS_PROSE_CLASS = getModuleClass(DEFINITIONS_CSS, "prose");

export interface DefinitionsProps extends ColorProps, GapVariants, SpacingVariants, TypographyVariants, OptionalChildProps {}

/**
 * Description list — a sequence of term/value pairs rendered as a `<dl>`.
 * - Each child should be a `<Definition>` (which renders the `<dt>`/`<dd>` pair wrapped in a `<div>`).
 * - Defaults to stacked layout (term above value). Pass `row` for side-by-side layout that collapses to stacked at narrow widths.
 */
export function Definitions({ children, ...variants }: DefinitionsProps): ReactElement {
	return (
		<dl
			className={getClass(
				DEFINITIONS_CLASS,
				getColorClass(variants),
				getGapClass(variants),
				getSpacingClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</dl>
	);
}
