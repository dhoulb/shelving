import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SUPERSCRIPT_CSS from "./Superscript.module.css";

export const SUPERSCRIPT_CLASS = getModuleClass(SUPERSCRIPT_CSS, "superscript");
export const SUPERSCRIPT_PROSE_CLASS = getModuleClass(SUPERSCRIPT_CSS, "prose");

export interface SuperscriptProps extends OptionalChildProps {}

export function Superscript({ children }: SuperscriptProps): ReactElement {
	return <sup className={SUPERSCRIPT_CLASS}>{children}</sup>;
}
