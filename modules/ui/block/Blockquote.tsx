import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Blockquote.module.css";

export interface BlockquoteProps extends OptionalChildProps {}

export function Blockquote({ children }: BlockquoteProps): ReactElement {
	return <blockquote className={styles.blockquote}>{children}</blockquote>;
}
