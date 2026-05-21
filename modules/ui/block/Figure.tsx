import type { ReactElement, ReactNode } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Figure.module.css";

export interface FigureProps extends OptionalChildProps {
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
