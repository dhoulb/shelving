import type { ReactElement, ReactNode } from "react";
import type { ImmutableArray } from "../../util/array.js";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { type GapVariants, getGapClass } from "../style/Gap.js";
import { getClass, getModuleClass } from "../util/css.js";
import LIST_CSS from "./List.module.css";

const LIST_ORDERED_CLASS = getModuleClass(LIST_CSS, "ordered");
const LIST_UNORDERED_CLASS = getModuleClass(LIST_CSS, "unordered");

/**
 * Props for `List` — colour, gap, space, and typography variants plus its list items and an `ordered` toggle.
 *
 * @see https://shelving.cc/ui/ListProps
 */
export interface ListProps extends GapVariants, BlockVariants {
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
export function List({ children, ordered = false, ...props }: ListProps): ReactElement {
	const items = children.map((v, i) => <li key={i.toString()}>{v}</li>);
	const className = getClass(
		ordered ? LIST_ORDERED_CLASS : LIST_UNORDERED_CLASS, //
		getBlockClass(props),
		getGapClass(props),
	);
	return ordered ? <ol className={className}>{items}</ol> : <ul className={className}>{items}</ul>;
}
