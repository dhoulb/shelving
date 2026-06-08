import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import STRONG_CSS from "./Strong.module.css";

export const STRONG_CLASS = getModuleClass(STRONG_CSS, "strong");
export const STRONG_PROSE_CLASS = getModuleClass(STRONG_CSS, "prose");

export interface StrongProps extends OptionalChildProps {}

export function Strong({ children }: StrongProps): ReactElement {
	return <strong className={STRONG_CLASS}>{children}</strong>;
}
