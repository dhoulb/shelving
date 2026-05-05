import type { ReactElement, ReactNode } from "react";
import styles from "./Figure.module.css";

export interface FigureProps {
	children?: ReactNode;
	caption?: ReactNode;
}

export function Figure({ children, caption }: FigureProps): ReactElement {
	return (
		<figure className={styles.figure}>
			{children}
			{caption && <figcaption className={styles.caption}>{caption}</figcaption>}
		</figure>
	);
}
