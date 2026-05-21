import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Superscript.module.css";

export interface SuperscriptProps extends OptionalChildProps {}

export function Superscript({ children }: SuperscriptProps): ReactElement {
	return <sup className={styles.superscript}>{children}</sup>;
}
