import type { ReactNode } from "react";
import styles from "./Table.module.css";

export interface TableProps {
	children: ReactNode;
}

export function Table({ children }: TableProps) {
	return (
		<div className={styles.wrap}>
			<table className={styles.table}>{children}</table>
		</div>
	);
}
