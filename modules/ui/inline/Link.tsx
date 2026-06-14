import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import { getModuleClass } from "../util/css.js";
import LINK_CSS from "./Link.module.css";

export const LINK_CLASS = getModuleClass(LINK_CSS, "link");
export const LINK_PROSE_CLASS = getModuleClass(LINK_CSS, "prose");

export interface LinkProps extends ClickableProps {}

export function Link(props: LinkProps): ReactElement {
	return <Clickable {...props} className={LINK_CLASS} />;
}
