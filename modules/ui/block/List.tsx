import type { ReactElement, ReactNode } from "react";
import styles from "./List.module.css";

export interface ListProps {
	children: ReactNode[];
	ordered?: boolean;
}

export function List({ children, ordered = false }: ListProps): ReactElement {
	const items = children.map((v, i) => <li key={i.toString()}>{v}</li>);
	return ordered ? <ol className={styles.ordered}>{items}</ol> : <ul className={styles.unordered}>{items}</ul>;
}
