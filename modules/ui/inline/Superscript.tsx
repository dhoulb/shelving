import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SUPERSCRIPT_CSS from "./Superscript.module.css";

const SUPERSCRIPT_CLASS = getModuleClass(SUPERSCRIPT_CSS, "superscript");

/**
 * Props for `Superscript` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Superscript/SuperscriptProps
 */
export interface SuperscriptProps extends OptionalChildProps {}

/**
 * Superscript text — renders a `<sup>` element for typographically raised text (e.g. exponents, footnote markers).
 *
 * @returns Rendered `<sup>` element.
 * @kind component
 * @example <>E = mc<Superscript>2</Superscript></>
 * @see https://dhoulb.github.io/shelving/ui/inline/Superscript/Superscript
 */
export function Superscript({ children }: SuperscriptProps): ReactElement {
	return <sup className={SUPERSCRIPT_CLASS}>{children}</sup>;
}
