import type { ReactElement, ReactNode } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import LIST_CSS from "./List.module.css";

const LIST_ORDERED_CLASS = getModuleClass(LIST_CSS, "ordered");
const LIST_UNORDERED_CLASS = getModuleClass(LIST_CSS, "unordered");

/**
 * Props for `List` — colour, gap, space, and typography variants plus its list items and an `ordered` toggle.
 *
 * @see https://shelving.cc/ui/ListProps
 */
export interface ListProps extends ColorVariants, GapVariants, SpaceVariants, TypographyVariants {
	children: ReactNode[];
	ordered?: boolean;
}

/**
 * List block — wraps each child in an `<li>` and renders an `<ul>` or `<ol>`.
 * - Pass `ordered` to render an ordered `<ol>` instead of the default unordered `<ul>`.
 *
 * @kind component
 * @returns Rendered `<ul>` or `<ol>` list element.
 * @example <List>{["One", "Two", "Three"]}</List>
 * @example <List ordered>{["First", "Second"]}</List>
 * @see https://shelving.cc/ui/List
 */
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
