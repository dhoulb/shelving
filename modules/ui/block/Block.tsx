import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getIndentClass, type IndentVariants } from "../style/Indent.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCK_CSS from "./Block.module.css";

const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");

/**
 * Semantic element names a block element may render as via its `as` prop.
 *
 * @see https://shelving.cc/ui/BlockElement
 */
export type BlockElement = "div" | "section" | "header" | "footer" | "article" | "nav" | "aside" | "figure";

/**
 * Props for `Block` — colour, space, typography, and width variants plus an optional `as` element override.
 *
 * @see https://shelving.cc/ui/BlockProps
 */
export interface BlockProps extends ColorVariants, IndentVariants, SpaceVariants, TypographyVariants, WidthVariants, OptionalChildProps {
	/**
	 * Element this `<Block>` renders as, e.g. "header" to output a "<header>"
	 * @default "div"
	 */
	as?: BlockElement | undefined;
}

/**
 * Get the combined `className` string for a block from its styling variants.
 *
 * Composes the base block class and tint ladder with the colour, space, typography, and width variant helpers, so anything that wants block-level styling can apply it.
 *
 * @param variants Colour, space, typography, and width variants.
 * @returns A space-separated `className` string combining the block class and resolved variant classes.
 * @example getBlockClass({ space: "large" }) // "block tint …"
 * @see https://shelving.cc/ui/getBlockClass
 */
export function getBlockClass(variants: BlockProps): string {
	return getClass(
		BLOCK_CLASS, //
		getColorClass(variants),
		getIndentClass(variants),
		getSpaceClass(variants),
		getTypographyClass(variants),
		getWidthClass(variants),
	);
}

/**
 * Plain `<div>` block with block-level spacing.
 * - Pass `as` to render a different semantic element (`section`, `header`, `footer`, `nav`, `aside`, `figure`).
 *
 * @kind component
 * @example <Block><Paragraph>Hello</Paragraph></Block>
 * @example <Block as="aside" width="narrow"><Paragraph>Sidebar</Paragraph></Block>
 * @see https://shelving.cc/ui/Block
 */
export function Block({ as: Element = "div", children, ...props }: BlockProps): ReactElement {
	return <Element className={getBlockClass(props)}>{children}</Element>;
}
