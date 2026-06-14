import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import EMPHASIS_CSS from "./Emphasis.module.css";

export const EMPHASIS_CLASS = getModuleClass(EMPHASIS_CSS, "emphasis");
export const EMPHASIS_PROSE_CLASS = getModuleClass(EMPHASIS_CSS, "prose");

export interface EmphasisProps extends OptionalChildProps {}

export function Emphasis({ children }: EmphasisProps): ReactElement {
	return <em className={EMPHASIS_CLASS}>{children}</em>;
}
