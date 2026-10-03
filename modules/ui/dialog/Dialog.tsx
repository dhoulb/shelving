import { XMarkIcon } from "@heroicons/react/24/solid";
import { type MouseEvent, memo, type ReactElement, Suspense, startTransition, useLayoutEffect, useRef, ViewTransition } from "react";
import type { Callback } from "../../util/function.js";
import { type ButtonVariants, getButtonClass } from "../button/Button.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import "../transition/FadeTransition.css";
import styles from "./Dialog.module.css";

/**
 * Props for `<Dialog>` — optional `children` content and an `onClose` callback.
 *
 * @see https://shelving.cc/ui/DialogProps
 */
export interface DialogProps extends OptionalChildProps {
	/** Called when the user closes the dialog. It must unmount the `<Dialog>`, and it runs inside `startTransition()` so the dialog animates out. */
	onClose?: Callback;
}

/**
 * Modal `<dialog>` element that opens on mount and includes a close button.
 *
 * - Opens via `showModal()` when mounted and closes on backdrop clicks, link/nav-button clicks, the close button, or the Escape key.
 * - The whole dialog fades in and out in one view transition. A `<Modal>` pinned to an edge leaves that layer and slides in its own.
 * - With `onClose`, a close request calls `onClose()` and the dialog stays open until it unmounts, so the view transition can capture it as it leaves.
 * - Wraps content in `<Suspense>` so lazy children can stream in.
 *
 * @kind component
 * @see https://shelving.cc/ui/Dialog
 */
export const Dialog = memo(({ children, onClose, ...props }: DialogProps) => {
	const ref = useRef<HTMLDialogElement>(null);

	// Open in a layout effect, not a passive effect. React runs layout effects inside the view transition's update, so the new snapshot shows the open dialog.
	useLayoutEffect(() => {
		ref.current?.showModal();
	}, []);

	return (
		<Suspense fallback={null}>
			{/* The transition must wrap the `<dialog>`: React only animates a `<ViewTransition>` that comes before any DOM element in the inserted or deleted tree. Fade only on enter and exit, so an open dialog stays still while another dialog opens or closes. */}
			<ViewTransition enter="fade" exit="fade">
				{/** biome-ignore lint/a11y/useKeyWithClickEvents: Dialogs also show a close button. */}
				<dialog
					ref={ref}
					className={getModuleClass(styles, "dialog")}
					onClick={_closeOnBackdropClick}
					onCancel={e => {
						// Keep the dialog open and let the parent unmount it in a transition. An uncancelable request closes natively and fires `onClose` from the `close` event.
						if (!onClose || !e.cancelable) return;
						e.preventDefault();
						startTransition(() => onClose());
					}}
					onClose={onClose}
					{...props}
				>
					{children}
					<div className={getModuleClass(styles, "close")}>
						<DialogCloseButton />
					</div>
				</dialog>
			</ViewTransition>
		</Suspense>
	);
});

/** When the user clicks anywhere on a `<dialog>` element (and the click isn't on a link etc), then close the dialog. */
function _closeOnBackdropClick({ currentTarget, target }: MouseEvent<HTMLDialogElement>): void {
	// Close the dialog when clicking on the dialog itself (but not its children).
	if (currentTarget === target) _requestClose(currentTarget);

	// Close the dialog when clicking on links or buttons in a `<nav>` element.
	if (target instanceof Element && target.closest("a:any-link, nav button:enabled")) _requestClose(currentTarget);
}

/** Ask a `<dialog>` to close. `requestClose()` fires a cancelable `cancel` event, so `<Dialog>` can run `onClose` in a transition. Older browsers close at once. */
function _requestClose(dialog: HTMLDialogElement): void {
	if (typeof dialog.requestClose === "function") dialog.requestClose();
	else dialog.close();
}

/**
 * Props for `<DialogCloseButton>` — button styling variants and optional `children` to override the X icon.
 *
 * @see https://shelving.cc/ui/DialogCloseButtonProps
 */
export interface DialogCloseButtonProps extends ButtonVariants, OptionalChildProps, ClassProps {}

/**
 * Button that closes its wrapping `<dialog>`, showing an X icon by default.
 * - Styled with the shared `Button` classes (positioning comes from the `<Dialog>`'s own `.close` wrapper rules).
 * - `plain` by default so only the icon shows until hover or focus — pass `plain={false}` for a solid button.
 *
 * @kind component
 * @see https://shelving.cc/ui/DialogCloseButton
 */
export function DialogCloseButton({
	children = <XMarkIcon />,
	plain = true,
	className,
	...variants
}: DialogCloseButtonProps): ReactElement {
	return (
		<button
			type="button"
			title="Close"
			className={getClass(getButtonClass({ plain, ...variants }), className)}
			onClick={_closeOnButtonClick}
		>
			{children}
		</button>
	);
}

function _closeOnButtonClick({ currentTarget }: MouseEvent<HTMLButtonElement>): void {
	const dialog = currentTarget.closest("dialog");
	if (dialog) _requestClose(dialog);
}
