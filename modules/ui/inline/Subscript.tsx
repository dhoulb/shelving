import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Subscript.module.css";

export interface SubscriptProps extends OptionalChildProps {}

export function Subscript({ children }: SubscriptProps): ReactElement {
	return <sub className={styles.subscript}>{children}</sub>;
}
