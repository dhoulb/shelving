import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import EMPHASIS_CSS from "./Emphasis.module.css";

/**
 * CSS class applied to the root element of every `Emphasis`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Emphasis/EMPHASIS_CLASS
 */
export const EMPHASIS_CLASS = getModuleClass(EMPHASIS_CSS, "emphasis");

/**
 * CSS class that styles `Emphasis` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Emphasis/EMPHASIS_PROSE_CLASS
 */
export const EMPHASIS_PROSE_CLASS = getModuleClass(EMPHASIS_CSS, "prose");

/**
 * Props for `Emphasis` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Emphasis/EmphasisProps
 */
export interface EmphasisProps extends OptionalChildProps {}

/**
 * Emphasised text — renders an `<em>` element for stress emphasis (typically italic).
 *
 * @param props The `children` to emphasise.
 * @returns Rendered `<em>` element.
 * @example <Emphasis>really</Emphasis>
 * @see https://dhoulb.github.io/shelving/ui/inline/Emphasis/Emphasis
 */
export function Emphasis({ children }: EmphasisProps): ReactElement {
	return <em className={EMPHASIS_CLASS}>{children}</em>;
}
