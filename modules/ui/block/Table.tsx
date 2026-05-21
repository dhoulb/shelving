import type { ChildProps } from "../util/props.js";
import styles from "./Table.module.css";

export interface TableProps extends ChildProps {}

export function Table({ children }: TableProps) {
	return (
		<div className={styles.wrap}>
			<table className={styles.table}>{children}</table>
		</div>
	);
}
