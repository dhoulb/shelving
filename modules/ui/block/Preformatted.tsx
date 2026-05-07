import type { ReactElement, ReactNode } from "react";
import styles from "./Preformatted.module.css";

export interface PreformattedProps {
	children?: ReactNode;
}

export function Preformatted({ children }: PreformattedProps): ReactElement {
	return <pre className={styles.preformatted}>{children}</pre>;
}
