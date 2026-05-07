import type { ReactElement, ReactNode } from "react";
import styles from "./Mark.module.css";

export interface MarkProps {
	children?: ReactNode;
}

export function Mark({ children }: MarkProps): ReactElement {
	return <mark className={styles.mark}>{children}</mark>;
}
