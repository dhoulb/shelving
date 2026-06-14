import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SUPERSCRIPT_CSS from "./Superscript.module.css";

/**
 * CSS class applied to the root element of every `Superscript`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Superscript/SUPERSCRIPT_CLASS
 */
export const SUPERSCRIPT_CLASS = getModuleClass(SUPERSCRIPT_CSS, "superscript");

/**
 * CSS class that styles `Superscript` when it appears inside `Prose` longform content.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Superscript/SUPERSCRIPT_PROSE_CLASS
 */
export const SUPERSCRIPT_PROSE_CLASS = getModuleClass(SUPERSCRIPT_CSS, "prose");

/**
 * Props for `Superscript` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Superscript/SuperscriptProps
 */
export interface SuperscriptProps extends OptionalChildProps {}

/**
 * Superscript text — renders a `<sup>` element for typographically raised text (e.g. exponents, footnote markers).
 *
 * @param props The `children` to render as superscript.
 * @returns Rendered `<sup>` element.
 * @example <>E = mc<Superscript>2</Superscript></>
 * @see https://dhoulb.github.io/shelving/ui/inline/Superscript/Superscript
 */
export function Superscript({ children }: SuperscriptProps): ReactElement {
	return <sup className={SUPERSCRIPT_CLASS}>{children}</sup>;
}
