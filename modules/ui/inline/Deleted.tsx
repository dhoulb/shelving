import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import DELETED_CSS from "./Deleted.module.css";

/**
 * CSS class applied to the root element of every `Deleted`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Deleted/DELETED_CLASS
 */
export const DELETED_CLASS = getModuleClass(DELETED_CSS, "definitions");

/**
 * CSS class that styles `Deleted` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Deleted/DELETED_PROSE_CLASS
 */
export const DELETED_PROSE_CLASS = getModuleClass(DELETED_CSS, "prose");

/**
 * Props for `Deleted` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Deleted/DeletedProps
 */
export interface DeletedProps extends OptionalChildProps {}

/**
 * Deleted text — renders a `<del>` element to mark content removed from a document.
 *
 * @param props The `children` to render as deleted text.
 * @returns Rendered `<del>` element.
 * @example <Deleted>old price</Deleted>
 * @see https://dhoulb.github.io/shelving/ui/inline/Deleted/Deleted
 */
export function Deleted({ children }: DeletedProps): ReactElement {
	return <del className={DELETED_CLASS}>{children}</del>;
}
