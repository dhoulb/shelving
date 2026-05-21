import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Modal.module.css";

export interface ModalProps extends OptionalChildProps {}

export function Modal({ children }: ModalProps): ReactElement {
	return <aside className={styles.modal}>{children}</aside>;
}
