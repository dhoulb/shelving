import type { ReactElement, ReactNode } from "react";
import styles from "./Subscript.module.css";

export interface SubscriptProps {
	children?: ReactNode;
}

export function Subscript({ children }: SubscriptProps): ReactElement {
	return <sub className={styles.subscript}>{children}</sub>;
}
