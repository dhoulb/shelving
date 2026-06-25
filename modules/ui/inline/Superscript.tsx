import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SUPERSCRIPT_CSS from "./Superscript.module.css";

const SUPERSCRIPT_CLASS = getModuleClass(SUPERSCRIPT_CSS, "superscript");

/**
 * Props for `Superscript` — optional `children`.
 *
 * @see https://shelving.cc/ui/SuperscriptProps
 */
export interface SuperscriptProps extends OptionalChildProps {}

/**
 * Superscript text — renders a `<sup>` element for typographically raised text (e.g. exponents, footnote markers).
 *
 * @kind component
 * @example <>E = mc<Superscript>2</Superscript></>
 * @see https://shelving.cc/ui/Superscript
 */
export function Superscript({ children }: SuperscriptProps): ReactElement {
	return <sup className={SUPERSCRIPT_CLASS}>{children}</sup>;
}
