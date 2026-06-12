import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { TINT_CLASS } from "../style/Tint.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import BLOCK_CSS from "./Block.module.css";

export const BLOCK_CLASS = getModuleClass(BLOCK_CSS, "block");
export const BLOCK_PROSE_CLASS = getModuleClass(BLOCK_CSS, "prose");

export type BlockElement = "div" | "section" | "header" | "footer" | "nav" | "aside" | "figure";

export interface BlockProps extends ColorVariants, SpaceVariants, TypographyVariants, WidthVariants, OptionalChildProps {
	as?: BlockElement | undefined;
}

/** Plain `<div>` block with block-level spacing. */
export function Block({ as: Component = "div", children, ...props }: BlockProps): ReactElement {
	return (
		<Component
			className={getClass(
				BLOCK_CLASS,
				TINT_CLASS,
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
				getWidthClass(props),
			)}
		>
			{children}
		</Component>
	);
}
