import { createContext, type ReactElement, type ReactNode, use } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import { ArrayStore } from "../../store/ArrayStore.js";
import { getRandomKey } from "../../util/random.js";
import type { ChildProps } from "../util/props.js";
import { Dialog } from "./Dialog.js";

/** How long before a hidden dialogs are removed from the DOM (allow time for animates to complete). */
const REMOVE_DELAY = 500;

/**
 * Store holding the live list of open [`<Dialog>`](/ui/Dialog) elements.
 *
 * - `show()` opens a new dialog; closed dialogs are removed after an animation delay.
 *
 * @example const dialogs = new DialogsStore(); dialogs.show(<p>Hello</p>);
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/DialogsStore
 */
export class DialogsStore extends ArrayStore<ReactElement> {
	/**
	 * Open a new dialog wrapping the given content.
	 *
	 * @param children The content to show inside the dialog.
	 * @example dialogs.show(<ConfirmForm />);
	 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/DialogsStore/show
	 */
	show(children: ReactNode) {
		const dialog = (
			<Dialog
				// Add a `key=""` so dialogs can be rendered directly and added/removed in any order.
				key={getRandomKey()}
				// When the `<dialog>` is closed, wait for the animation to finish then remove the dialog from the list.
				onClose={() => {
					setTimeout(() => this.delete(dialog), REMOVE_DELAY);
				}}
			>
				{children}
			</Dialog>
		);
		this.add(dialog);
	}

	/**
	 * Hide all currently visible dialogs.
	 *
	 * @example dialogs.hideAll();
	 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/DialogsStore/hideAll
	 */
	hideAll() {
		this.delete(...this.value);
	}
}

/** Context to get the current `DialogsStore` created by a `<DialogsWrapper>`. */
const _DialogsContext = createContext<DialogsStore>(new DialogsStore());
_DialogsContext.displayName = "DialogsContext";

/**
 * Read the current `DialogsStore` from the nearest `<DialogsContext>`.
 *
 * @returns The current `DialogsStore`.
 * @example requireDialogs().show(<ConfirmForm />);
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/requireDialogs
 */
export function requireDialogs(): DialogsStore {
	return use(_DialogsContext);
}

declare const _componentProps: unique symbol;

/**
 * Props for `<DialogsContext>` — the `children` subtree the dialogs store is provided to.
 *
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/DialogsContextProps
 */
export interface DialogsContextProps extends ChildProps {}

/**
 * Props for `<Dialogs>` — takes no props (branded empty interface).
 *
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/DialogsProps
 */
export interface DialogsProps {
	readonly [_componentProps]?: never;
}

/**
 * Provider that creates a fresh `DialogsStore` and shares it with its subtree.
 *
 * @param children The subtree that can open dialogs via `requireDialogs()`.
 * @returns The dialogs context provider wrapping `children`.
 * @example <DialogsContext><App /></DialogsContext>
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/DialogsContext
 */
export function DialogsContext({ children }: DialogsContextProps): ReactElement {
	return <_DialogsContext value={useInstance(DialogsStore)}>{children}</_DialogsContext>;
}

/**
 * Render the open dialogs from the current `DialogsContext`.
 *
 * @returns The list of open dialog elements, or `null` when there are none.
 * @example <DialogsContext><App /><Dialogs /></DialogsContext>
 * @see https://dhoulb.github.io/shelving/ui/dialog/Dialogs/Dialogs
 */
export function Dialogs(): ReactNode | null {
	const dialogs = useStore(requireDialogs());
	return dialogs ? dialogs.value : null;
}
