import type { ReactElement, ReactNode } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import LIST_CSS from "./List.module.css";

/**
 * CSS class applied to an ordered `List` (`<ol>`).
 *
 * @see https://dhoulb.github.io/shelving/ui/block/List/LIST_ORDERED_CLASS
 */
export const LIST_ORDERED_CLASS = getModuleClass(LIST_CSS, "ordered");

/**
 * CSS class applied to an unordered `List` (`<ul>`).
 *
 * @see https://dhoulb.github.io/shelving/ui/block/List/LIST_UNORDERED_CLASS
 */
export const LIST_UNORDERED_CLASS = getModuleClass(LIST_CSS, "unordered");

/**
 * CSS class that styles a `List` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/List/LIST_PROSE_CLASS
 */
export const LIST_PROSE_CLASS = getModuleClass(LIST_CSS, "prose");

/**
 * Props for `List` — colour, gap, space, and typography variants plus its list items and an `ordered` toggle.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/List/ListProps
 */
export interface ListProps extends ColorVariants, GapVariants, SpaceVariants, TypographyVariants {
	children: ReactNode[];
	ordered?: boolean;
}

/**
 * List block — wraps each child in an `<li>` and renders an `<ul>` or `<ol>`.
 * - Pass `ordered` to render an ordered `<ol>` instead of the default unordered `<ul>`.
 *
 * @param props Colour, gap, space, and typography variants plus the `children` items and `ordered` toggle.
 * @returns Rendered `<ul>` or `<ol>` list element.
 * @example <List>{["One", "Two", "Three"]}</List>
 * @example <List ordered>{["First", "Second"]}</List>
 * @see https://dhoulb.github.io/shelving/ui/block/List/List
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
