import type { ReactElement } from "react";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import styles from "./Modal.module.css";

/**
 * Props for `<Modal>` — optional `children` content.
 *
 * @see https://shelving.cc/ui/ModalProps
 */
export interface ModalProps extends OptionalChildProps, ClassProps {}

/**
 * Styled `<aside>` panel for content inside a `<Dialog>`, with dark text on a light surface.
 *
 * @kind component
 * @see https://shelving.cc/ui/Modal
 */
export function Modal({ children, className }: ModalProps): ReactElement {
	return <aside className={getClass(getModuleClass(styles, "modal"), className)}>{children}</aside>;
}
