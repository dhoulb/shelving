import type { ReactElement, ReactNode } from "react";
import styles from "./Strong.module.css";

export interface StrongProps {
	children?: ReactNode;
}

export function Strong({ children }: StrongProps): ReactElement {
	return <strong className={styles.strong}>{children}</strong>;
}
