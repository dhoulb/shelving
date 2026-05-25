import type { ReactElement, ReactNode } from "react";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./List.module.css";

export interface ListProps extends GapVariants, SpacingVariants, TypographyVariants {
	children: ReactNode[];
	ordered?: boolean;
}

export function List({ children, ordered = false, ...variants }: ListProps): ReactElement {
	const items = children.map((v, i) => <li key={i.toString()}>{v}</li>);
	const className = getClass(
		getModuleClass(styles, ordered ? "ordered" : "unordered"),
		getGapClass(variants),
		getSpacingClass(variants),
		getTypographyClass(variants),
	);
	return ordered ? <ol className={className}>{items}</ol> : <ul className={className}>{items}</ul>;
}
