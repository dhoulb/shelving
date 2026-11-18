import { createContext } from "react";

/**
 * Controls for the nearest `<Dialog>`, so a `<Modal>` inside it can swipe it away.
 * - Internal: not exported from the `shelving/ui` barrel.
 */
export interface DialogControl {
	/** Hide the dialog in a `"dialog"` transition, so its exit transition runs. It stays mounted, with its state. */
	readonly hide: () => void;
	/** Show the hidden dialog again at once, with no transition. Resolves after React commits it. */
	readonly show: () => Promise<void>;
	/** Close the dialog for real (calls its `onClose`). */
	readonly close: () => void;
}

/** Context with the controls for the nearest `<Dialog>`, or `undefined` outside one (or in a `<Dialog>` with no `onClose`). */
export const DialogControlContext = createContext<DialogControl | undefined>(undefined);
DialogControlContext.displayName = "DialogControlContext";
