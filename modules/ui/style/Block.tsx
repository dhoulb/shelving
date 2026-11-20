import { getClass, getModuleClass } from "../util/css.js";
import BLOCK_CSS from "./Block.module.css";
import { getHeightClass, type HeightVariants } from "./Height.js";
import { getIndentClass, type IndentVariants } from "./Indent.js";
import { getPaddingClass, type PaddingVariants } from "./Padding.js";
import { getSpaceClass, type SpaceVariants } from "./Space.js";
import { getTrimClass, type TrimVariants } from "./Trim.js";
import { getTypographyClass, type TypographyVariants } from "./Typography.js";
import { getWidthClass, type WidthVariants } from "./Width.js";

const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");

/**
 * Variants for block level elements.
 *
 * @see https://shelving.cc/ui/BlockVariants
 */
export interface BlockVariants
	extends IndentVariants,
		SpaceVariants,
		PaddingVariants,
		TrimVariants,
		TypographyVariants,
		WidthVariants,
		HeightVariants {}

/**
 * Get the combined `className` string for a block from its styling variants.
 *
 * Composes the base block class with the indent, padding, space, trim, typography, width, and height variant helpers, so anything that wants block-level styling can apply it.
 *
 * @returns A space-separated `className` string combining the block class and resolved variant classes.
 * @example getBlockClass({ space: "large" }) // "block tint …"
 * @see https://shelving.cc/ui/getBlockClass
 */
export function getBlockClass(variants: BlockVariants): string {
	return getClass(
		BLOCK_CLASS, //
		getIndentClass(variants),
		getPaddingClass(variants),
		getSpaceClass(variants),
		getTrimClass(variants),
		getTypographyClass(variants),
		getWidthClass(variants),
		getHeightClass(variants),
	);
}
