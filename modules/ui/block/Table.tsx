import type { ReactElement } from "react";
import { type ColorVariants, getColorClass } from "../style/Color.js";
import { getSpaceClass, type SpaceVariants } from "../style/Space.js";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import TABLE_CSS from "./Table.module.css";

const TABLE_CLASS = getModuleClass(TABLE_CSS, "table");

/**
 * Props for `Table` — colour, space, typography, and width variants plus `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Table/TableProps
 */
export interface TableProps extends ColorVariants, SpaceVariants, TypographyVariants, WidthVariants, ChildProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Scroll horizontal>` if the table may exceed the container width on small screens.
 * - `<th>` / `<td>` cells draw the borders (the `<table>` element itself has none); override their weight via the `--table-border` / `--table-stroke` hooks.
 *
 * @kind component
 * @param props Colour, space, typography, and width variants plus `children`.
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
				getWidthClass(props),
			)}
		>
			{children}
		</table>
	);
}
