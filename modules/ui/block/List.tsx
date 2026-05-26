import type { ReactElement, ReactNode } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpacingClass, type SpacingVariants } from "../style/Spacing.js";
import { getStatusClass, type Status } from "../style/Status.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import styles from "./List.module.css";

export interface ListProps extends ColorVariants, GapVariants, SpacingVariants, TypographyVariants {
	children: ReactNode[];
	ordered?: boolean;
	/** Status colour for the list (e.g. `"error"`). Combine with a `text-X` variant to tint the text. */
	status?: Status | undefined;
}

export function List({ children, ordered = false, status, ...variants }: ListProps): ReactElement {
	const items = children.map((v, i) => <li key={i.toString()}>{v}</li>);
	const className = getClass(
		getModuleClass(styles, ordered ? "ordered" : "unordered"),
		status && getStatusClass(status),
		getColorClass(variants),
		getGapClass(variants),
		getSpacingClass(variants),
		getTypographyClass(variants),
	);
	return ordered ? <ol className={className}>{items}</ol> : <ul className={className}>{items}</ul>;
}
