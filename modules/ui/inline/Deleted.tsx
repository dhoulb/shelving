import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Deleted.module.css";

export interface DeletedProps extends OptionalChildProps {}

export function Deleted({ children }: DeletedProps): ReactElement {
	return <del className={styles.deleted}>{children}</del>;
}
