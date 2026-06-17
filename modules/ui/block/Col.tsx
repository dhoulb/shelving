import type { ReactElement } from "react";
import { getWidthClass, type WidthVariants } from "../style/Width.js";

/**
 * Props for `Col` — the `width` (and `grow`) variants that size a table column.
 *
 * @see https://dhoulb.github.io/shelving/ui/block/Col/ColProps
 */
export interface ColProps extends WidthVariants {}

/**
 * Table column — rendered as `<col>`.
 * - Place inside a `<colgroup>` at the top of a `Table`, one `Col` per column, to size the columns via the `width` variant.
 * - `width="fit"` shrinks a column to its content; an exact `width` (e.g. `width="12x"`) acts as a floor a column can grow past in the default auto table-layout — add `grow` to make that explicit.
 *
 * @kind component
 * @param props The `width` / `grow` variant props.
 * @returns Rendered `<col>` element.
 * @example <colgroup><Col width="fit" /><Col width="12x" grow /></colgroup>
 * @see https://dhoulb.github.io/shelving/ui/block/Col/Col
 */
export function Col(props: ColProps): ReactElement {
	return <col className={getWidthClass(props)} />;
}
