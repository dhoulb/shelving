import { XMarkIcon } from "@heroicons/react/24/solid";
import { type MouseEvent, memo, type ReactElement, Suspense, useEffect, useRef } from "react";
import type { Callback } from "../../util/function.js";
import type { ButtonVariants } from "../form/Button.js";
import { getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Dialog.module.css";

/**
 * Props for `<Dialog>` — optional `children` content and an `onClose` callback.
 *
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialog/DialogProps
 */
export interface DialogProps extends OptionalChildProps {
	onClose?: Callback;
}

/**
 * Modal `<dialog>` element that opens on mount and includes a close button.
 *
 * - Opens via `showModal()` when mounted and closes on backdrop clicks, link/nav-button clicks, or the close button.
 * - Wraps content in `<Suspense>` so lazy children can stream in.
 *
 * @example dialogs.show(<Dialog><p>Are you sure?</p></Dialog>);
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialog/Dialog
 */
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

/**
 * Props for `<DialogCloseButton>` — button styling variants and optional `children` to override the X icon.
 *
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialog/DialogCloseButtonProps
 */
export interface DialogCloseButtonProps extends ButtonVariants, OptionalChildProps {}

/**
 * Button that closes its wrapping `<dialog>`, showing an X icon by default.
 *
 * @param children Optional button content (defaults to an X icon).
 * @param variants Button styling variants.
 * @returns The close button element.
 * @example <DialogCloseButton plain />
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialog/DialogCloseButton
 */
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
