import type { ReactElement, ReactNode } from "react";
import styles from "./Blockquote.module.css";

export interface BlockquoteProps {
	children?: ReactNode;
}

export function Blockquote({ children }: BlockquoteProps): ReactElement {
	return <blockquote className={styles.blockquote}>{children}</blockquote>;
}
