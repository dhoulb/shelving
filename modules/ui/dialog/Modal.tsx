import type { ReactElement } from "react";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Modal.module.css";

/**
 * Props for `<Modal>` — optional `children` content.
 *
 * @see https://dhoulb.github.io/shelving/ui/dialog/Modal/ModalProps
 */
export interface ModalProps extends OptionalChildProps {}

/**
 * Styled `<aside>` overlay container for modal content.
 *
 * @kind component
 * @param children The modal content.
 * @returns The modal container element.
 * @example <Modal><p>Modal content</p></Modal>
 * @see https://dhoulb.github.io/shelving/ui/dialog/Modal/Modal
 */
export function Modal({ children }: ModalProps): ReactElement {
	return <aside className={styles.modal}>{children}</aside>;
}
