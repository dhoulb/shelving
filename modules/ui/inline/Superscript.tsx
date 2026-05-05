import type { ReactElement, ReactNode } from "react";
import styles from "./Superscript.module.css";

export interface SuperscriptProps {
	children?: ReactNode;
}

export function Superscript({ children }: SuperscriptProps): ReactElement {
	return <sup className={styles.superscript}>{children}</sup>;
}
