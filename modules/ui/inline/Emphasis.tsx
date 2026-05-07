import type { ReactElement, ReactNode } from "react";
import styles from "./Emphasis.module.css";

export interface EmphasisProps {
	children?: ReactNode;
}

export function Emphasis({ children }: EmphasisProps): ReactElement {
	return <em className={styles.emphasis}>{children}</em>;
}
