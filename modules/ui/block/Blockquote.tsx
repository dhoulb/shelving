import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCKQUOTE_CSS from "./Blockquote.module.css";

export const BLOCKQUOTE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "blockquote");
export const BLOCKQUOTE_PROSE_CLASS = getModuleClass(BLOCKQUOTE_CSS, "prose");

export interface BlockquoteProps extends ColorVariants, SpaceVariants, TypographyVariants, OptionalChildProps {}

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
