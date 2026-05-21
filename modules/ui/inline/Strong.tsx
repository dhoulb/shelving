import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Strong.module.css";

export interface StrongProps extends OptionalChildProps {}

export function Strong({ children }: StrongProps): ReactElement {
	return <strong className={styles.strong}>{children}</strong>;
}
