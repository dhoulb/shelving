/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import type { ReactElement, ReactNode } from "react";

import { isTruthy } from "../../util/boolean.js";
import type { Callback } from "../../util/function.js";
import { getClass, getModuleClass } from "../util/css.js";
import { eventPreventDefault } from "../util/event.js";
import { eventLoopFocus } from "../util/focus.js";
import type { ClassProps } from "../util/props.js";
import styles from "./Popover.module.css";

/**
 * Children tuple for `Popover`: a leading trigger node followed by the popover's contents.
 *
 * @see https://shelving.cc/ui/PopoverChildren
 */
export type PopoverChildren = readonly [
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

/**
 * Props for `Popover`, a trigger element that reveals floating content.
 *
 * @see https://shelving.cc/ui/PopoverProps
 */
export interface PopoverProps extends ClassProps {
	/** Children for the popover. */
	children: PopoverChildren;
	/** Callback that gets called when the Popover closes. */
	onClose?: Callback;
	/** Whether the popover is open/closed (defaults to whether all `popoverChildren` nodes has at least one truthy node). */
	open?: boolean;
}

/**
 * Trigger element that reveals a floating popover panel beside it when active or focused.
 * - The first `children` node is the trigger; the rest become the popover contents.
 * - Closes on blur away or `Escape`, calling `onClose`.
 * - `className` lands on the floating panel rather than the wrapper, since the panel is the surface worth styling.
 *
 * @returns A wrapper element containing the trigger and (when open) the popover panel.
 * @example <Popover>{trigger}{panelContent}</Popover>
 * @see https://shelving.cc/ui/Popover
 *
 * @todo DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 */
export function Popover({
	children: [trigger, ...popover], //
	onClose,
	open = popover.flat().some(isTruthy),
	className,
}: PopoverProps): ReactElement {
	return (
		<div
			className={getModuleClass(styles, "wrap")}
			onBlur={e => {
				if (e.relatedTarget) eventLoopFocus(e);
				else onClose?.();
			}}
			onKeyDown={e => e.key === "Escape" && onClose?.()}
		>
			{trigger}
			{open ? (
				<section className={getClass(getModuleClass(styles, "panel"), className)} onMouseDown={eventPreventDefault}>
					{popover}
				</section>
			) : null}
		</div>
	);
}
