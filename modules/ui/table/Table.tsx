import type { ReactElement } from "react";
import { type BlockVariants, getBlockClass } from "../style/Block.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ChildProps, ClassProps } from "../util/props.js";
import TABLE_CSS from "./Table.module.css";

const TABLE_CLASS = getModuleClass(TABLE_CSS, "table");

/**
 * Props for `Table` — colour, space, typography, and width variants plus `children`.
 * - `padding` and `indent` set the padding of every cell, not of the `<table>` itself.
 *
 * @see https://shelving.cc/ui/TableProps
 */
export interface TableProps extends BlockVariants, ChildProps, ClassProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Scroll horizontal>` if the table may exceed the container width on small screens.
 * - `<th>` / `<td>` cells draw the borders (the `<table>` element itself has none); override their weight via the `--table-border` / `--table-stroke` hooks.
 * - `padding` sets the top and bottom padding of every cell, and `indent` the left and right. A `<Cell>` with its own `padding` or `indent` overrides them.
 *
 * @kind component
 * @see https://shelving.cc/ui/Table
 */
export function Table({ padding, indent, children, className, ...props }: TableProps): ReactElement {
	return (
		<table
			className={getClass(
				TABLE_CLASS, //
				padding && getModuleClass(TABLE_CSS, `padding-${padding}`),
				indent && getModuleClass(TABLE_CSS, `indent-${indent}`),
				getBlockClass(props),
				className,
			)}
		>
			{children}
		</table>
	);
}
