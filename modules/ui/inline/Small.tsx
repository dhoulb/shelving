import type { ReactElement, ReactNode } from "react";
import styles from "./Small.module.css";

export interface SmallProps {
	children?: ReactNode;
}

export function Small({ children }: SmallProps): ReactElement {
	return <small className={styles.small}>{children}</small>;
}
