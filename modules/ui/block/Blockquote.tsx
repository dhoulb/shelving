import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCKQUOTE_CSS from "./Blockquote.module.css";

/**
 * CSS class applied to the root `<blockquote>` element of every `Blockquote`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Blockquote/BLOCKQUOTE_CLASS
 */
export const BLOCKQUOTE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "blockquote");

/**
 * CSS class that styles `<blockquote>` elements when they appear inside `Prose`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Blockquote/BLOCKQUOTE_PROSE_CLASS
 */
export const BLOCKQUOTE_PROSE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "prose");

/**
 * Props for `Blockquote` — colour, space, and typography variants plus optional children.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Blockquote/BlockquoteProps
 */
export interface BlockquoteProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/**
 * Quoted block of text — rendered as `<blockquote>`.
 *
 * @example <Blockquote>To be or not to be.</Blockquote>
 * @see https://dhoulb.github.io/shelving/ui/block/Blockquote/Blockquote
 */
export function Blockquote({ children, ...props }: BlockquoteProps): ReactElement {
	return (
		<blockquote
			className={getClass(
				BLOCKQUOTE_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</blockquote>
	);
}
