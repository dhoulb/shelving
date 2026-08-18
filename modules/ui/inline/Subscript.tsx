import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import SUBSCRIPT_CSS from "./Subscript.module.css";

const SUBSCRIPT_CLASS = getModuleClass(SUBSCRIPT_CSS, "subscript");

/**
 * Props for `Subscript` — optional `children`.
 *
 * @see https://shelving.cc/ui/SubscriptProps
 */
export interface SubscriptProps extends OptionalChildProps, ClassProps {}

/**
 * Subscript text — renders a `<sub>` element for typographically lowered text (e.g. chemical formulae).
 *
 * @kind component
 * @example <>H<Subscript>2</Subscript>O</>
 * @see https://shelving.cc/ui/Subscript
 */
export function Subscript({ children, className }: SubscriptProps): ReactElement {
	return <sub className={getClass(SUBSCRIPT_CLASS, className)}>{children}</sub>;
}
