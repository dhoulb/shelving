import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { getModuleClass } from "../util/css.js";
import LINK_CSS from "./Link.module.css";

/**
 * CSS class applied to the root element of every `Link`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Link/LINK_CLASS
 */
export const LINK_CLASS = getModuleClass(LINK_CSS, "link");

/**
 * CSS class that styles a `Link` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Link/LINK_PROSE_CLASS
 */
export const LINK_PROSE_CLASS = getModuleClass(LINK_CSS, "prose");

/**
 * Props for `Link` — identical to `ClickableProps` (`href` for navigation or `onClick` for actions).
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Link/LinkProps
 */
export interface LinkProps extends ClickableProps {}

/**
 * Inline link — delegates to `Clickable`, rendering an `<a>` (when `href` is set) or `<button>` (when `onClick` is set).
 *
 * @kind component
 * @param props Clickable props such as `href`, `onClick`, `title`, and `children`.
 * @returns Rendered inline `<a>` or `<button>` element.
 * @example <Link href="/about">About us</Link>
 * @see https://dhoulb.github.io/shelving/ui/inline/Link/Link
 */
export function Link(props: LinkProps): ReactElement {
	return <Clickable {...props} className={LINK_CLASS} />;
}
