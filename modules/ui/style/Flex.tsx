import { getClass, getModuleClass } from "../util/css.js";
import FLEX_CSS from "./Flex.module.css";
import { type GapVariants, getGapClass } from "./Gap.js";

/**
 * Variant props for flex layout — opt-in modifiers any component can mix in via `getFlexClass()`.
 *
 * @see https://shelving.cc/ui/FlexVariants
 */
export interface FlexVariants extends GapVariants {
	/** Wrap overflowing elements onto the next line. */
	wrap?: boolean | undefined;
	/** Overflowing elements _do not_ wrap onto the next line. */
	nowrap?: boolean | undefined;
	/** Display the elements as a column (defaults to row). */
	column?: boolean | undefined;
	/** Reverse the order of the elements. */
	reverse?: boolean | undefined;
	/**
	 * Rows: Justify the elements across to stretch across the full width (this is the default for rows) (primary axis).
	 * Columns: Justify the elements across to stretch across the full height (this is the default for columns) (primary axis).
	 */
	stretch?: boolean | undefined;
	/**
	 * Rows: Justify the elements with space between them (primary axis).
	 * Columns: Justify the elements with space between them (primary axis).
	 */
	between?: boolean | undefined;
	/**
	 * Rows: Justify the elements with space around them (primary axis).
	 * Columns: Justify the elements with space around them (primary axis).
	 */
	around?: boolean | undefined;
	/**
	 * Rows: Justify the elements to the left (primary axis).
	 * Columns: Align the elements to the left (secondary axis).
	 */
	left?: boolean | undefined;
	/**
	 * Rows: Justify the elements to the center (primary axis).
	 * Columns: Align the elements to the center (secondary axis).
	 */
	center?: boolean | undefined;
	/**
	 * Rows: Justify the elements to the right (primary axis).
	 * Columns: Align the elements to the right (secondary axis).
	 */
	right?: boolean | undefined;
	/**
	 * Rows: Align the elements to the top (secondary axis).
	 * Columns: Justify the elements to the top (primary axis).
	 */
	top?: boolean | undefined;
	/**
	 * Rows: Align the elements to the middle (secondary axis).
	 * Columns: Justify the elements to the middle (primary axis).
	 */
	middle?: boolean | undefined;
	/**
	 * Rows: Align the elements to the bottom (secondary axis).
	 * Columns: Justify the elements to the bottom (primary axis).
	 */
	bottom?: boolean | undefined;
	/**
	 * Rows: Align the text baselines of the elements (in rows or columns)
	 * Columns: Not-applicable, has no effect.
	 */
	baseline?: boolean | undefined;
}

/**
 * Get the flex layout class for a component from its flex variant props.
 *
 * @returns The combined flex + gap class string.
 * @example getFlexClass({ column: true, center: true, gap: "large" })
 * @see https://shelving.cc/ui/getFlexClass
 */
export function getFlexClass(variants: FlexVariants): string {
	return getClass(
		getModuleClass(FLEX_CSS, "flex", variants), //
		getGapClass(variants),
	);
}
