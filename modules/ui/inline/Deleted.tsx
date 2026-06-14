import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import DELETED_CSS from "./Deleted.module.css";

export const DELETED_CLASS = getModuleClass(DELETED_CSS, "definitions");
export const DELETED_PROSE_CLASS = getModuleClass(DELETED_CSS, "prose");

export interface DeletedProps extends OptionalChildProps {}

export function Deleted({ children }: DeletedProps): ReactElement {
	return <del className={DELETED_CLASS}>{children}</del>;
}
