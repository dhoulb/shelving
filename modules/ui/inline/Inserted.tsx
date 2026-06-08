import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import INSERTED_CSS from "./Inserted.module.css";

export const INSERTED_CLASS = getModuleClass(INSERTED_CSS, "inserted");
export const INSERTED_PROSE_CLASS = getModuleClass(INSERTED_CSS, "prose");

export interface InsertedProps extends OptionalChildProps {}

export function Inserted({ children }: InsertedProps): ReactElement {
	return <ins className={INSERTED_CLASS}>{children}</ins>;
}
