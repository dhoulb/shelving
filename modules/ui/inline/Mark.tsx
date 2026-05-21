import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Mark.module.css";

export interface MarkProps extends OptionalChildProps {}

export function Mark({ children }: MarkProps): ReactElement {
	return <mark className={styles.mark}>{children}</mark>;
}
