import { getClass, getModuleClass } from "../util/css.js";
import BLOCK_CSS from "./Block.module.css";
import { getIndentClass, type IndentVariants } from "./Indent.js";
import { getPaddingClass, type PaddingVariants } from "./Padding.js";
import { getSpaceClass, type SpaceVariants } from "./Space.js";
import { getTypographyClass, type TypographyVariants } from "./Typography.js";
import { getWidthClass, type WidthVariants } from "./Width.js";

const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");
const BLOCK_MIDDLE_CLASS = getModuleClass(BLOCK_CSS, "middle");

/**
 * Variants for block level elements.
 *
 * @see https://shelving.cc/ui/BlockVariants
 */
export interface BlockVariants extends IndentVariants, SpaceVariants, PaddingVariants, TypographyVariants, WidthVariants {
	/**
	 * Make the block at least as tall as its container, and centre its content vertically (defaults to `false`).
	 * - Content taller than the container makes the block grow, so a scroll box scrolls it from the top and nothing is cut off.
	 * - Has no effect on flex components such as `<Row>` and `<Column>`: wrap them in a `<Block middle>`.
	 */
	middle?: boolean | undefined;
}

/**
 * Get the combined `className` string for a block from its styling variants.
 *
 * Composes the base block class and tint ladder with the colour, space, typography, and width variant helpers, plus the `middle` variant, so anything that wants block-level styling can apply it.
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
		getTypographyClass(variants),
		getWidthClass(variants),
		variants.middle && BLOCK_MIDDLE_CLASS,
	);
}
