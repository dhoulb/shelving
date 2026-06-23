import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCKQUOTE_CSS from "./Blockquote.module.css";

const BLOCKQUOTE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "blockquote");

/**
 * Props for `Blockquote` — colour, space, and typography variants plus optional children.
 *
 * @see https://shelving.cc/ui/BlockquoteProps
 */
export interface BlockquoteProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

/**
 * Quoted block of text — rendered as `<blockquote>`.
 *
 * @kind component
 * @example <Blockquote>To be or not to be.</Blockquote>
 * @see https://shelving.cc/ui/Blockquote
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
