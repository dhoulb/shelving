/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import type { ReactElement, ReactNode } from "react";

import { isTruthy } from "../../util/boolean.js";
import type { Callback } from "../../util/function.js";
import { eventPreventDefault } from "../util/event.js";
import { eventLoopFocus } from "../util/focus.js";
import styles from "./Popover.module.css";

export type PopoverChildren = [
	/**
	 * First child of the <Popover> is element that activates the popover.
	 * - Should be a `<Button>` or `<Input>` that activates or provides the children.
	 */
	trigger: ReactNode,
	/**
	 * Remaining children are the contents of the popover.
	 */
	...popover: ReactNode[],
];

export interface PopoverProps {
	/** Children for the popover. */
	children: PopoverChildren;
	/** Callback that gets called when the Popover closes. */
	onClose?: Callback;
	/** Whether the popover is open/closed (defaults to whether all `popoverChildren` nodes has at least one truthy node). */
	open?: boolean;
}

/**
 * An input button that, when clicked, shows a popover next to it when clicked or focused.
 * - The first element passed to `children` is used as the content for the button, the rest is the content of the popover.
 *
 * @todo DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 */
export function Popover({
	children: [trigger, ...popover], //
	onClose,
	open = popover.flat().some(isTruthy),
}: PopoverProps): ReactElement {
	return (
		<div
			className={styles.wrap}
			onBlur={e => {
				if (e.relatedTarget) eventLoopFocus(e);
				else onClose?.();
			}}
			onKeyDown={e => e.key === "Escape" && onClose?.()}
		>
			{trigger}
			{open ? (
				<section className={styles.panel} onMouseDown={eventPreventDefault}>
					{popover}
				</section>
			) : null}
		</div>
	);
}
