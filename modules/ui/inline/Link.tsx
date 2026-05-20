import type { ReactElement } from "react";
import { Clickable, type ClickableProps } from "../form/Clickable.js";
import styles from "./Link.module.css";

export interface LinkProps extends ClickableProps {}

export function Link(props: LinkProps): ReactElement {
	return <Clickable {...props} className={styles.link} />;
}
