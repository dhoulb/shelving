import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import MARK_CSS from "./Mark.module.css";

export const MARK_CLASS = getModuleClass(MARK_CSS, "mark");
export const MARK_PROSE_CLASS = getModuleClass(MARK_CSS, "prose");

export interface MarkProps extends OptionalChildProps {}

export function Mark({ children }: MarkProps): ReactElement {
	return <mark className={MARK_CLASS}>{children}</mark>;
}
