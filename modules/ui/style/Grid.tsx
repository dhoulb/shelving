import { getClass, getModuleClass } from "../util/css.js";
import { type GapVariants, getGapClass } from "./Gap.js";
import GRID_CSS from "./Grid.module.css";

/**
 * Number of equal-width columns selectable via the `columns` variant prop.
 *
 * @see https://shelving.cc/ui/ColumnsVariant
 */
export type ColumnsVariant = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

/**
 * Variant props for grid layout, e.g. `columns={3} gap="normal"`.
 *
 * @see https://shelving.cc/ui/GridVariants
 */
export interface GridVariants extends GapVariants {
	/**
	 * Number of equal-width columns.
	 * @default 2
	 */
	columns?: ColumnsVariant | undefined;
}

/**
 * Get the grid layout class for a component from its grid variant props.
 *
 * @returns The combined grid + gap class string.
 * @example getGridClass({ columns: 3, gap: "normal" })
 * @see https://shelving.cc/ui/getGridClass
 */
export function getGridClass({ columns = 2, ...variants }: GridVariants): string {
	return getClass(
		getModuleClass(GRID_CSS, "grid", `columns-${columns}`), //
		getGapClass(variants),
	);
}
