import type { ReactElement, ReactNode } from "react";
import styles from "./Deleted.module.css";

export interface DeletedProps {
	children?: ReactNode;
}

export function Deleted({ children }: DeletedProps): ReactElement {
	return <del className={styles.deleted}>{children}</del>;
}
