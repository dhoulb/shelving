import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Inserted.module.css";

export interface InsertedProps extends OptionalChildProps {}

export function Inserted({ children }: InsertedProps): ReactElement {
	return <ins className={styles.inserted}>{children}</ins>;
}
