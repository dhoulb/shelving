import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Small.module.css";

export interface SmallProps extends OptionalChildProps {}

export function Small({ children }: SmallProps): ReactElement {
	return <small className={styles.small}>{children}</small>;
}
