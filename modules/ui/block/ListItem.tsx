import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";

/**
 * Props for `ListItem` — space, padding, trim, and typography variants.
 *
 * @see https://shelving.cc/ui/ListItemProps
 */
export interface ListItemProps extends BlockVariants, OptionalChildProps, ClassProps {}

/**
 * One item in a `<List>` — rendered as `<li>`.
 *
 * @kind component
 * @see https://shelving.cc/ui/ListItem
 */
export function ListItem({ children, className, ...props }: ListItemProps): ReactElement {
	return <li className={getClass(getBlockClass(props), className)}>{children}</li>;
}
