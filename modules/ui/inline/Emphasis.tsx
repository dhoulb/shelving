import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Emphasis.module.css";

export interface EmphasisProps extends OptionalChildProps {}

export function Emphasis({ children }: EmphasisProps): ReactElement {
	return <em className={styles.emphasis}>{children}</em>;
}
