import { type MouseEvent, memo, type ReactElement, Suspense, ViewTransition } from "react";
import { CloseIcon } from "shelving/icon/CloseIcon";
import type { Callback } from "../../util/function.js";
import { type ButtonVariants, getButtonClass } from "../button/Button.js";
import { FADE_TRANSITION_CLASS } from "../transition/FadeTransition.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import styles from "./Dialog.module.css";
import modalStyles from "./Modal.module.css";

/**
 * Props for `<Dialog>` — optional `children` content and an `onClose` callback.
 *
 * @see https://shelving.cc/ui/DialogProps
 */
export interface DialogProps extends OptionalChildProps {
	/** Called when the user asks to close the dialog. It must unmount the `<Dialog>`. Unmount it inside `startTransition()` to animate it out (`<Dialogs>` does this for you). */
	onClose?: Callback;
}

/**
 * Modal `<dialog>` element that opens on mount and includes a close button.
 *
 * - Opens via `showModal()` when mounted, and closes on a tap anywhere on it, the close button, or the Escape key.
 * - A tap on a control (button, input, select, textarea, label) or inside a `<Modal>` panel does not close it. A tap on a link or a `<nav>` button always closes it.
 * - It knows nothing about transitions. It fades in and out only when the update that mounts or unmounts it is a transition, e.g. from `<Dialogs>` or your own `startTransition()`. A `<Modal>` pinned to an edge then slides in its own layer.
 * - A change inside an open dialog (new content, a Suspense reveal) runs no view transition. The page ignores taps while one runs.
 * - With `onClose`, it is declarative: a close request calls `onClose()`, and the dialog stays open until it unmounts, so a view transition can capture it as it leaves.
 * - Children sit in one wrapper in normal block layout, `--dialog-width` wide and centred on the screen. Content taller than the screen scrolls from its top.
 * - Wraps content in `<Suspense>` so lazy children can stream in.
 *
 * @kind component
 * @see https://shelving.cc/ui/Dialog
 */
export const Dialog = memo(({ children, onClose, ...props }: DialogProps) => {
	return (
		<Suspense fallback={null}>
			{/* The transition must wrap the `<dialog>`: React only animates a `<ViewTransition>` that comes before any DOM element in the inserted or deleted tree. Fade only on enter and exit, so an open dialog stays still while another dialog opens or closes. No update transition: the page ignores taps while a view transition runs, so a change inside an open dialog must not start one. */}
			<ViewTransition default="none" enter={FADE_TRANSITION_CLASS} exit={FADE_TRANSITION_CLASS}>
				{/** biome-ignore lint/a11y/useKeyWithClickEvents: Dialogs also show a close button. */}
				<dialog
					ref={_showModal}
					className={getModuleClass(styles, "dialog")}
					onClick={_closeOnClick}
					onCancel={e => {
						// Keep the dialog open until the parent unmounts it. An uncancelable request closes natively and fires `onClose` from the `close` event.
						if (!onClose || !e.cancelable) return;
						e.preventDefault();
						onClose();
					}}
					onClose={onClose}
					{...props}
				>
					<div className={getModuleClass(styles, "content")}>{children}</div>
					<div className={getModuleClass(styles, "close")}>
						<DialogCloseButton />
					</div>
				</dialog>
			</ViewTransition>
		</Suspense>
	);
});

/**
 * Open a `<dialog>` as a modal when React attaches it.
 * - A ref callback, not a layout effect. React holds the layout effects of a view transition until its images are ready, and an image in a closed `<dialog>` is never ready, so a layout effect would never open a dialog with an image in it.
 * - The ref callback still runs inside the view transition's update, so the new snapshot shows the open dialog.
 */
function _showModal(dialog: HTMLDialogElement | null): void {
	if (dialog && !dialog.open) dialog.showModal();
}

/** Links and `<nav>` buttons always close the dialog. */
const CLOSE_SELECTOR = "a:any-link, nav button:enabled";

/** Taps on controls and inside a `<Modal>` panel (a true modal, e.g. a form) never close the dialog. */
const KEEP_SELECTOR = `button, input, select, textarea, label, .${getModuleClass(modalStyles, "modal")}`;

/** When the user taps anywhere on a `<dialog>` element, close it, unless the tap is on a control or inside a `<Modal>`. */
function _closeOnClick({ currentTarget, target }: MouseEvent<HTMLDialogElement>): void {
	if (!(target instanceof Element)) return;

	// Ignore taps in a nested dialog. React events bubble through the React tree, so they can reach an outer dialog.
	if (target.closest("dialog") !== currentTarget) return;

	if (target.closest(CLOSE_SELECTOR) || !target.closest(KEEP_SELECTOR)) requestDialogClose(currentTarget);
}

/**
 * Ask a `<dialog>` element to close, the same way as the Escape key.
 * - Fires a cancelable `cancel` event, so a `<Dialog>` keeps itself open and calls its `onClose`. Its parent then unmounts it, and it can animate out.
 * - Closes the dialog at once only if nothing cancels the event.
 * - Use it instead of `dialog.close()`, which closes at once and fires no `cancel` event, so the dialog vanishes with no transition.
 * - Not `requestClose()`: some browsers lack it, and Safari fires its `cancel` event as not cancelable. Both close the dialog at once.
 *
 * @param dialog The `<dialog>` element to close.
 * @example requestDialogClose(dialog) // Like pressing Escape.
 * @see https://shelving.cc/ui/requestDialogClose
 */
export function requestDialogClose(dialog: HTMLDialogElement): void {
	if (dialog.dispatchEvent(new Event("cancel", { cancelable: true }))) dialog.close();
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
	children = <CloseIcon />,
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
	if (dialog) requestDialogClose(dialog);
}
