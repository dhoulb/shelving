import type { ReactElement } from "react";
import { type ClickableProps, getClickable } from "../form/Clickable.js";
import styles from "./Link.module.css";

export interface LinkProps extends ClickableProps {}

export function Link(props: LinkProps): ReactElement {
	return getClickable(props, styles.link);
}
