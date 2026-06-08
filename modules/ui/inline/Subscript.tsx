import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SUBSCRIPT_CSS from "./Subscript.module.css";

export const SUBSCRIPT_CLASS = getModuleClass(SUBSCRIPT_CSS, "subscript");
export const SUBSCRIPT_PROSE_CLASS = getModuleClass(SUBSCRIPT_CSS, "prose");

export interface SubscriptProps extends OptionalChildProps {}

export function Subscript({ children }: SubscriptProps): ReactElement {
	return <sub className={SUBSCRIPT_CLASS}>{children}</sub>;
}
