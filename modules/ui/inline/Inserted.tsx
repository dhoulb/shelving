import type { ReactElement, ReactNode } from "react";
import styles from "./Inserted.module.css";

export interface InsertedProps {
	children?: ReactNode;
}

export function Inserted({ children }: InsertedProps): ReactElement {
	return <ins className={styles.inserted}>{children}</ins>;
}
