import type { ReactElement } from "react";
import { getTypographyClass, type TypographyVariants } from "../style/Typography.js";
import { getWidthClass, type WidthVariants } from "../style/Width.js";
import { getClass } from "../util/css.js";
import type { ChildProps } from "../util/props.js";

/**
 * Props for `TableHeader` — width and typography variants plus `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/TableHeader/TableHeaderProps
 */
export interface TableHeaderProps extends WidthVariants, TypographyVariants, ChildProps {}

/**
 * Table header cell — rendered as `<th>`.
 * - Sets its column's width via the `width` variant (e.g. `width="fit"` to hug the content). Unlike a `<col>`, a cell honours `min-width`, so `width="12x" grow` gives the column a hard minimum it can grow past.
 * - A column's width is the widest of its cells, so sizing the `<th>` sizes the whole column.
 *
 * @kind component
 * @returns Rendered `<th>` element.
 * @example <TableHeader width="fit">Parameter</TableHeader>
 * @see https://dhoulb.github.io/shelving/ui/block/TableHeader/TableHeader
 */
export function TableHeader({ children, ...props }: TableHeaderProps): ReactElement {
	return <th className={getClass(getWidthClass(props), getTypographyClass(props)) || undefined}>{children}</th>;
}
