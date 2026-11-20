import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import LAYOUT_CSS from "./ResetLayout.module.css";

const LAYOUT_CLASS = getModuleClass(LAYOUT_CSS, "layout");

/**
 * Props for `<ResetLayout>`: the content slot `children`.
 *
 * @see https://shelving.cc/ui/ResetLayoutProps
 */
export interface ResetLayoutProps extends OptionalChildProps {}

/**
 * Layout that only removes the margin and padding around the page, so content can go edge to edge.
 * - It sets margin and padding to zero on `<html>`, `<body>`, and each element between `<body>` and the layout (for example `<div id="root">`).
 * - It does not lock, scroll, or centre. The page scrolls as normal.
 *
 * @kind component
 * @see https://shelving.cc/ui/ResetLayout
 */
export function ResetLayout({ children }: ResetLayoutProps): ReactElement {
	return <div className={LAYOUT_CLASS}>{children}</div>;
}
