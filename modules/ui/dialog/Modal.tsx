import type { ReactElement } from "react";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Modal.module.css";

/**
 * Props for `<Modal>` — optional `children` content.
 *
 * @see https://shelving.cc/ui/ModalProps
 */
export interface ModalProps extends OptionalChildProps {}

/**
 * Styled `<aside>` overlay container for modal content.
 *
 * @kind component
 * @param children The modal content.
 * @returns The modal container element.
 * @example <Modal><p>Modal content</p></Modal>
 * @see https://shelving.cc/ui/Modal
 */
export function Modal({ children }: ModalProps): ReactElement {
	return <aside className={getModuleClass(styles, "modal")}>{children}</aside>;
}
