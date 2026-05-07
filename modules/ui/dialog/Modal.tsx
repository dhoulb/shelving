import type { ReactElement, ReactNode } from "react";
import styles from "./Modal.module.css";

export type ModalProps = {
	children?: ReactNode | undefined;
};

export function Modal({ children }: ModalProps): ReactElement {
	return <aside className={styles.modal}>{children}</aside>;
}
