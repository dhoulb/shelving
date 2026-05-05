import { type MouseEvent, memo, type ReactElement, type ReactNode, Suspense, useEffect, useRef } from "react";
import type { Callback } from "shelving";
import { XMarkIcon } from "shelving/icon";
import type { ButtonVariants } from "../form/Button.js";
import { getModuleClass } from "../util/css.js";
import styles from "./Dialog.module.css";

export interface DialogProps {
	children?: ReactNode;
	onClose?: Callback;
}

export const Dialog = memo(({ children, onClose, ...props }: DialogProps) => {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		ref.current?.showModal();
	}, []);

	return (
		<Suspense fallback={null}>
			{/** biome-ignore lint/a11y/useKeyWithClickEvents: Dialogs also show a close button. */}
			<dialog ref={ref} className={styles.dialog} onClick={_closeOnBackdropClick} onClose={onClose} {...props}>
				{children}
				<div className={styles.close}>
					<DialogCloseButton plain />
				</div>
			</dialog>
		</Suspense>
	);
});

/** When the user clicks anywhere on a `<dialog>` element (and the click isn't on a link etc), then close the dialog. */
function _closeOnBackdropClick({ currentTarget, target }: MouseEvent<HTMLDialogElement>): void {
	// Close the dialog when clicking on the dialog itself (but not its children).
	if (currentTarget === target) currentTarget.close();

	// Close the dialog when clicking on links or buttons in a `<nav>` element.
	if (target instanceof Element && target.closest("a:any-link, nav button:enabled")) currentTarget.close();
}

export interface DialogCloseButtonProps extends ButtonVariants {
	children?: ReactNode | undefined;
}

/** Button that closes its wrapping dialog with an X icon. */
export function DialogCloseButton({ children = <XMarkIcon />, ...variants }: DialogCloseButtonProps): ReactElement {
	return (
		<button type="button" title="Close" className={getModuleClass(styles, "button", variants)} onClick={_closeOnButtonClick}>
			{children}
		</button>
	);
}

function _closeOnButtonClick({ currentTarget }: MouseEvent<HTMLButtonElement>): void {
	currentTarget.closest("dialog")?.close();
}
