import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { getModuleClass } from "../util/css.js";
import LINK_CSS from "./Link.module.css";

const LINK_CLASS = getModuleClass(LINK_CSS, "link");

/**
 * Props for `Link` — identical to `ClickableProps` (`href` for navigation or `onClick` for actions).
 *
 * @see https://shelving.cc/ui/LinkProps
 */
export interface LinkProps extends ClickableProps {}

/**
 * Inline link — delegates to `<Clickable>`, rendering an `<a>` (when `href` is set) or `<button>` (when `onClick` is set).
 *
 * @kind component
 * @returns Rendered inline `<a>` or `<button>` element.
 * @example <Link href="/about">About us</Link>
 * @see https://shelving.cc/ui/Link
 */
export function Link(props: LinkProps): ReactElement {
	return <Clickable {...props} className={LINK_CLASS} />;
}
