import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import TABLE_CSS from "./Table.module.css";

/**
 * CSS class applied to the root element of every `Table`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Table/TABLE_CLASS
 */
export const TABLE_CLASS = getModuleClass(TABLE_CSS, "divider");

/**
 * CSS class that styles a `Table` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Table/TABLE_PROSE_CLASS
 */
export const TABLE_PROSE_CLASS = getModuleClass(TABLE_CSS, "prose");

/**
 * Props for `Table` — colour, space, and typography variants plus `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Table/TableProps
 */
export interface TableProps extends ColorVariants, SpaceVariants, TypographyVariants, ChildProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Scroll horizontal>` if the table may exceed the container width on small screens.
 * - `<th>` / `<td>` cells draw the borders (the `<table>` element itself has none); override their weight via the `--table-border` / `--table-stroke` hooks.
 *
 * @kind component
 * @param props Colour, space, and typography variants plus `children`.
 * @returns Rendered `<table>` element.
 * @example <Table><tbody><tr><td>Cell</td></tr></tbody></Table>
 * @see https://dhoulb.github.io/shelving/ui/block/Table/Table
 */
export function Table({ children, ...props }: TableProps): ReactElement {
	return (
		<table
			className={getClass(
				TABLE_CLASS, //
				getColorClass(props),
				getSpaceClass(props),
				getTypographyClass(props),
			)}
		>
			{children}
		</table>
	);
}
