import type { ReactElement, ReactNode } from "react";
import { type AlignVariants, getAlignClass } from "../style/Align.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getThicknessClass, type ThicknessVariants } from "../style/Thickness.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Definitions.module.css";

export interface DefinitionsProps
	extends AlignVariants,
		GapVariants,
		SpacingVariants,
		ThicknessVariants,
		TypographyVariants,
		OptionalChildProps {
	/** Lay out each term/value pair side-by-side instead of stacked (collapses to stacked at narrow widths). */
	row?: boolean | undefined;
}

/**
 * Description list — a sequence of term/value pairs rendered as a `<dl>`.
 * - Each child should be a `<Definition>` (which renders the `<dt>`/`<dd>` pair wrapped in a `<div>`).
 * - Defaults to stacked layout (term above value). Pass `row` for side-by-side layout that collapses to stacked at narrow widths.
 *
 * @example
 * <Definitions>
 *   <Definition term="Name">Dave</Definition>
 *   <Definition term="Role">Engineer</Definition>
 * </Definitions>
 */
export function Definitions({ children, ...variants }: DefinitionsProps): ReactElement {
	return (
		<dl
			className={getClass(
				getModuleClass(styles, "definitions", variants),
				getAlignClass(variants),
				getGapClass(variants),
				getSpacingClass(variants),
				getThicknessClass(variants),
				getTypographyClass(variants),
			)}
		>
			{children}
		</dl>
	);
}

export interface DefinitionProps extends OptionalChildProps {
	/** The term — what's being defined. Rendered as `<dt>`. */
	term: ReactNode;
}

/**
 * A single term/value pair within a `<Definitions>` list.
 * - Wraps the `<dt>`/`<dd>` pair in a `<div>` so each pair is a single grouped element (valid HTML5 inside `<dl>`).
 * - This sidesteps the dl-shaped wart of having no per-pair wrapper; it also gives the row/stacked layout something concrete to target.
 */
export function Definition({ term, children }: DefinitionProps): ReactElement {
	return (
		<div className={styles.pair}>
			<dt className={styles.term}>{term}</dt>
			<dd className={styles.value}>{children}</dd>
		</div>
	);
}
