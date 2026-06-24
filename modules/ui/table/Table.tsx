import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";
import TABLE_CSS from "./Table.module.css";

const TABLE_CLASS = getModuleClass(TABLE_CSS, "table");

/**
import { type BlockVariants, getBlockClass } from "../style/Block.js";
 * Props for `Table` — colour, space, typography, and width variants plus `children`.
 *
 * @see https://shelving.cc/ui/TableProps
 */
export interface TableProps extends BlockVariants, ChildProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Scroll horizontal>` if the table may exceed the container width on small screens.
 * - `<th>` / `<td>` cells draw the borders (the `<table>` element itself has none); override their weight via the `--table-border` / `--table-stroke` hooks.
 *
 * @kind component
 * @returns Rendered `<table>` element.
 * @example <Table><tbody><tr><td>Cell</td></tr></tbody></Table>
 * @see https://shelving.cc/ui/Table
 */
export function Table({ children, ...props }: TableProps): ReactElement {
	return (
		<table
			className={getClass(
				TABLE_CLASS, //
				getBlockClass(props),
			)}
		>
			{children}
		</table>
	);
}
