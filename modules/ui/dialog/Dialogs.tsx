import { createContext, type ReactElement, type ReactNode, use } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import { ArrayStore } from "../../store/ArrayStore.js";
import { getRandomKey } from "../../util/random.js";
import { Dialog } from "./Dialog.js";

/** How long before a hidden dialogs are removed from the DOM (allow time for animates to complete). */
const REMOVE_DELAY = 500;

/** Store a list of dialogs. */
export class DialogsStore extends ArrayStore<ReactElement> {
	/** Show a new dialog. */
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

	/** Hide all currently visible dialogs. */
	hideAll() {
		this.delete(...this.value);
	}
}

/** Context to get the current `DialogsStore` created by a `<DialogsWrapper>`. */
const _DialogsContext = createContext<DialogsStore>(new DialogsStore());
_DialogsContext.displayName = "DialogsContext";

/** Return the current dialogs context. */
export function requireDialogs(): DialogsStore {
	return use(_DialogsContext);
}

declare const _componentProps: unique symbol;

export interface DialogsContextProps {
	children: ReactNode;
}

export interface DialogsProps {
	readonly [_componentProps]?: never;
}

/** Create a new `<DialogsStore>` for a set of elements. */
export function DialogsContext({ children }: DialogsContextProps): ReactElement {
	return <_DialogsContext value={useInstance(DialogsStore)}>{children}</_DialogsContext>;
}

/** Output the list of dialogs from a `DialogsStore` in the current `DialogsContext`. */
export function Dialogs(): ReactNode | null {
	const dialogs = useStore(requireDialogs());
	return dialogs ? dialogs.value : null;
}
