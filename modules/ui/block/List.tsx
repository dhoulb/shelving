import type { ReactElement, ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps } from "../util/props.js";
import LIST_CSS from "./List.module.css";

const LIST_ORDERED_CLASS = getModuleClass(LIST_CSS, "ordered");
const LIST_UNORDERED_CLASS = getModuleClass(LIST_CSS, "unordered");

/**
 * Props for `List` — colour, gap, space, and typography variants plus its list items and an `ordered` toggle.
 *
 * @see https://shelving.cc/ui/ListProps
 */
export interface ListProps extends GapVariants, BlockVariants, ClassProps {
	readonly children: ImmutableArray<ReactNode>;
	readonly ordered?: boolean | undefined;
}

/**
 * List block — wraps each child in an `<li>` and renders an `<ul>` or `<ol>`.
 * - Pass `ordered` to render an ordered `<ol>` instead of the default unordered `<ul>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/List
 */
export function List({ children, ordered = false, className, ...props }: ListProps): ReactElement {
	const items = children.map((v, i) => <li key={i.toString()}>{v}</li>);
	const classes = getClass(
		ordered ? LIST_ORDERED_CLASS : LIST_UNORDERED_CLASS, //
		getBlockClass(props),
		getGapClass(props),
		className,
	);
	return ordered ? <ol className={classes}>{items}</ol> : <ul className={classes}>{items}</ul>;
}
