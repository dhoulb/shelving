import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SUBSCRIPT_CSS from "./Subscript.module.css";

const SUBSCRIPT_CLASS = getModuleClass(SUBSCRIPT_CSS, "subscript");

/**
 * Props for `Subscript` — optional `children`.
 *
 * @see https://dhoulb.github.io/shelving/ui/inline/Subscript/SubscriptProps
 */
export interface SubscriptProps extends OptionalChildProps {}

/**
 * Subscript text — renders a `<sub>` element for typographically lowered text (e.g. chemical formulae).
 *
 * @returns Rendered `<sub>` element.
 * @kind component
 * @example <>H<Subscript>2</Subscript>O</>
 * @see https://dhoulb.github.io/shelving/ui/inline/Subscript/Subscript
 */
export function Subscript({ children }: SubscriptProps): ReactElement {
	return <sub className={SUBSCRIPT_CLASS}>{children}</sub>;
}
