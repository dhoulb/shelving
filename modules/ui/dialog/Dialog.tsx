/// <reference types="react/canary" />
import {
	Activity,
	addTransitionType,
	type MouseEvent,
	memo,
	type ReactElement,
	Suspense,
	startTransition,
	useCallback,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
	ViewTransition,
} from "react";
import { CloseIcon } from "shelving/icon/CloseIcon";
import type { Callback } from "../../util/function.js";
import { type ButtonVariants, getButtonClass } from "../button/Button.js";
import { FADE_TRANSITION_CLASS } from "../transition/FadeTransition.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import styles from "./Dialog.module.css";
import { type DialogControl, DialogControlContext } from "./DialogControl.js";
import modalStyles from "./Modal.module.css";

/**
 * Props for `<Dialog>` — optional `children` content and an `onClose` callback.
 *
 * @see https://shelving.cc/ui/DialogProps
 */
export interface DialogProps extends OptionalChildProps {
	/**
	 * Called when the user asks to close the dialog. It must unmount the `<Dialog>`. Unmount it inside `startTransition()` to animate it out (`<Dialogs>` does this for you).
	 * - `instant` is `true` for a tap on a link: the page change runs its own view transition, so unmount the dialog at once, outside a transition.
	 */
	onClose?: Callback<[instant?: boolean]>;
}

/**
 * Modal `<dialog>` element that opens on mount.
 *
 * - Opens via `showModal()` when mounted, and closes on a tap anywhere on it, or the Escape key.
 * - It hears taps and close requests with native listeners, so a tap still closes it while React waits for a view transition to start (React ignores events then).
 * - It has no close button. Give the content an explicit button that closes it (for example "OK"), or add a `<DialogCloseButton>`.
 * - A tap on a control (button, input, select, textarea, label) or inside a `<Modal>` panel does not close it. A tap on a link or a `<nav>` button always closes it.
 * - A tap on a link calls `onClose(true)`: the dialog goes at once, so the page change gets the view transition. A separate close transition would take the page's transition types and hold the page change until it ends.
 * - It knows nothing about transitions. It fades in and out only when the update that mounts or unmounts it is a transition, e.g. from `<Dialogs>` or your own `startTransition()`. A `<Modal>` pinned to an edge then slides in its own layer.
 * - A change inside an open dialog (new content, a Suspense reveal) runs no view transition. The page ignores taps while one runs.
 * - With `onClose`, it is declarative: a close request calls `onClose()`, and the dialog stays open until it unmounts, so a view transition can capture it as it leaves.
 * - Children sit in one wrapper in normal block layout, `--dialog-width` wide and centred on the screen. Content taller than the screen scrolls from its top.
 * - Wraps content in `<Suspense>` so lazy children can stream in.
 * - With `onClose`, a `<Modal>` pinned to an edge can swipe it away. During the swipe the dialog is hidden in an `<Activity>`, not unmounted, so a cancelled swipe keeps its state.
 *
 * @kind component
 * @see https://shelving.cc/ui/Dialog
 */
export const Dialog = memo(({ children, onClose, ...props }: DialogProps) => {
	const [hidden, setHidden] = useState(false);
	const hiddenRef = useRef(hidden);
	hiddenRef.current = hidden;
	const waiting = useRef<(() => void)[]>([]);
	const closeRef = useRef(onClose);
	closeRef.current = onClose;
	const ref = useCallback((dialog: HTMLDialogElement) => _listen(dialog, closeRef), []);
	// Resolve `show()` calls once React has committed the shown dialog.
	useLayoutEffect(() => {
		if (!hidden) for (const resolve of waiting.current.splice(0)) resolve();
	}, [hidden]);
	const control = useMemo<DialogControl | undefined>(
		() =>
			onClose && {
				hide: () =>
					startTransition(() => {
						addTransitionType("dialog");
						setHidden(true);
					}),
				show: () =>
					new Promise<void>(resolve => {
						if (!hiddenRef.current) return resolve();
						waiting.current.push(resolve);
						setHidden(false);
					}),
				close: onClose,
			},
		[onClose],
	);
	return (
		<Activity mode={hidden ? "hidden" : "visible"}>
			<DialogControlContext value={control}>
				<Suspense fallback={null}>
					{/* The transition must wrap the `<dialog>`: React only animates a `<ViewTransition>` that comes before any DOM element in the inserted or deleted tree. Fade only on enter and exit, so an open dialog stays still while another dialog opens or closes. No update transition: the page ignores taps while a view transition runs, so a change inside an open dialog must not start one. */}
					<ViewTransition default="none" enter={FADE_TRANSITION_CLASS} exit={FADE_TRANSITION_CLASS}>
						<dialog ref={ref} className={getModuleClass(styles, "dialog")} {...props}>
							<div className={getModuleClass(styles, "content")}>{children}</div>
						</dialog>
					</ViewTransition>
				</Suspense>
			</DialogControlContext>
		</Activity>
	);
});

/**
 * Open a `<dialog>` as a modal when React attaches it, and listen for taps and close requests on it.
 * - A ref callback, not a layout effect. React holds the layout effects of a view transition until its images are ready, and an image in a closed `<dialog>` is never ready, so a layout effect would never open a dialog with an image in it.
 * - The ref callback still runs inside the view transition's update, so the new snapshot shows the open dialog.
 * - Native listeners, not React props: React ignores every event from the moment it asks for a view transition until the transition's update runs. A tap in that gap still reaches the page's own link handler, so the page changed and the dialog stayed open.
 *
 * @returns A function that removes the listeners.
 */
function _listen(dialog: HTMLDialogElement, closeRef: { readonly current: DialogProps["onClose"] }): () => void {
	if (!dialog.open) dialog.showModal();
	const onClick = (e: globalThis.MouseEvent) => _closeOnClick(e, closeRef.current);
	const onCancel = (e: Event) => {
		// Keep the dialog open until the parent unmounts it. An uncancelable request closes natively and fires `onClose` from the `close` event.
		const onClose = closeRef.current;
		if (!onClose || !e.cancelable) return;
		e.preventDefault();
		onClose();
	};
	const onClose = () => closeRef.current?.();
	dialog.addEventListener("click", onClick);
	dialog.addEventListener("cancel", onCancel);
	dialog.addEventListener("close", onClose);
	return () => {
		dialog.removeEventListener("click", onClick);
		dialog.removeEventListener("cancel", onCancel);
		dialog.removeEventListener("close", onClose);
	};
}

/** Links and `<nav>` buttons always close the dialog. */
const CLOSE_SELECTOR = "a:any-link, nav button:enabled";

/** Taps on controls and inside a `<Modal>` panel (a true modal, e.g. a form) never close the dialog. */
const KEEP_SELECTOR = `button, input, select, textarea, label, .${getModuleClass(modalStyles, "modal")}`;

/** When the user taps anywhere on a `<dialog>` element, close it, unless the tap is on a control or inside a `<Modal>`. */
function _closeOnClick({ currentTarget, target }: globalThis.MouseEvent, onClose: DialogProps["onClose"]): void {
	if (!(target instanceof Element) || !(currentTarget instanceof HTMLDialogElement)) return;

	// Ignore taps in a nested dialog.
	if (target.closest("dialog") !== currentTarget) return;

	// A link changes the page, so close at once and leave the view transition to the page change.
	if (onClose && target.closest("a:any-link")) onClose(true);
	else if (target.closest(CLOSE_SELECTOR) || !target.closest(KEEP_SELECTOR)) requestDialogClose(currentTarget);
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
 * - A `<Dialog>` has no close button of its own. Put this anywhere inside the dialog to add one.
 * - It is fixed to the top-right corner of the screen, clear of the safe areas.
 * - Styled with the shared `Button` classes.
 * - `plain` and `small` by default, so only a small icon shows until hover or focus. Pass `plain={false}` for a solid button, or `small={false}` for a normal size.
 *
 * @kind component
 * @see https://shelving.cc/ui/DialogCloseButton
 */
export function DialogCloseButton({
	children = <CloseIcon />,
	plain = true,
	small = true,
	className,
	...variants
}: DialogCloseButtonProps): ReactElement {
	return (
		<button
			type="button"
			title="Close"
			className={getClass(getModuleClass(styles, "close"), getButtonClass({ plain, small, ...variants }), className)}
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
