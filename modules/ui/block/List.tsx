import type { ReactElement, ReactNode } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import LIST_CSS from "./List.module.css";

export const LIST_ORDERED_CLASS = getModuleClass(LIST_CSS, "ordered");
export const LIST_UNORDERED_CLASS = getModuleClass(LIST_CSS, "unordered");
export const LIST_PROSE_CLASS = getModuleClass(LIST_CSS, "prose");

export interface ListProps extends ColorVariants, GapVariants, SpaceVariants, TypographyVariants {
	children: ReactNode[];
	ordered?: boolean;
}

export function List({ children, ordered = false, ...props }: ListProps): ReactElement {
	const items = children.map((v, i) => <li key={i.toString()}>{v}</li>);
	const className = getClass(
		ordered ? LIST_ORDERED_CLASS : LIST_UNORDERED_CLASS,
		getColorClass(props),
		getGapClass(props),
		getSpaceClass(props),
		getTypographyClass(props),
	);
	return ordered ? <ol className={className}>{items}</ol> : <ul className={className}>{items}</ul>;
}
