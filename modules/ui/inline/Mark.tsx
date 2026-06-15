import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import MARK_CSS from "./Mark.module.css";

/**
 * CSS class applied to the root element of every `Mark`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Mark/MARK_CLASS
 */
export const MARK_CLASS = getModuleClass(MARK_CSS, "mark");

/**
 * CSS class that styles `Mark` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Mark/MARK_PROSE_CLASS
 */
export const MARK_PROSE_CLASS = getModuleClass(MARK_CSS, "prose");

/**
 * Props for `Mark` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Mark/MarkProps
 */
export interface MarkProps extends OptionalChildProps {}

/**
 * Highlighted text — renders a `<mark>` element to call attention to a run of text.
 *
 * @kind component
 * @param props The `children` to highlight.
 * @returns Rendered `<mark>` element.
 * @example <Mark>search term</Mark>
 * @see https://dhoulb.github.io/shelving/ui/inline/Mark/Mark
 */
export function Mark({ children }: MarkProps): ReactElement {
	return <mark className={MARK_CLASS}>{children}</mark>;
}
