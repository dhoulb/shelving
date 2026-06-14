import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import SMALL_CSS from "./Small.module.css";

export const SMALL_CLASS = getModuleClass(SMALL_CSS, "small");
export const SMALL_PROSE_CLASS = getModuleClass(SMALL_CSS, "prose");

export interface SmallProps extends OptionalChildProps {}

export function Small({ children }: SmallProps): ReactElement {
	return <small className={SMALL_CSS}>{children}</small>;
}
