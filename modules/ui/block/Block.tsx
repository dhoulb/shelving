import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCK_CSS from "./Block.module.css";

const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");

/**
 * Semantic element names a `Block` may render as via its `as` prop.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Block/BlockElement
 */
export type BlockElement = "div" | "section" | "header" | "footer" | "nav" | "aside" | "figure";

/**
 * Props for `Block` — colour, space, typography, and width variants plus an optional `as` element override.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Block/BlockProps
 */
export interface BlockProps extends ColorVariants, SpaceVariants, TypographyVariants, WidthVariants, OptionalChildProps {
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
 * @see https://dhoulb.github.io/shelving/ui/block/Block/getBlockClass
 */
export function getBlockClass(variants: BlockProps): string {
	return getClass(
		BLOCK_CLASS, //
		getColorClass(variants),
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
 * @see https://dhoulb.github.io/shelving/ui/block/Block/Block
 */
export function Block({ as: Component = "div", children, ...props }: BlockProps): ReactElement {
	return <Component className={getBlockClass(props)}>{children}</Component>;
}
