import type { ReactElement } from "react";
import type { ChildProps } from "../util/props.js";
import styles from "./Table.module.css";

export interface TableProps extends ChildProps {}

/**
 * Table block — rendered as `<table>`.
 * - Wrap in a `<Figure scrollable>` (or any `scrollable` block) if the table may exceed the container width on small screens.
 */
export function Table({ children }: TableProps): ReactElement {
	return <table className={styles.table}>{children}</table>;
}
