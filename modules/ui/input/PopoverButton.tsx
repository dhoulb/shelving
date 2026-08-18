/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import { type ReactElement, useState } from "react";
import { Button, type ButtonVariants } from "../button/Button.js";
import type { ClassProps } from "../util/props.js";
import { Popover, type PopoverChildren } from "./Popover.js";

/**
 * Props for `PopoverButton` — all the `Button` styling variants, plus `children` whose first node is the button label and the rest the popover contents.
 *
 * @see https://shelving.cc/ui/PopoverButtonProps
 */
export interface PopoverButtonProps extends ButtonVariants, ClassProps {
	children: PopoverChildren;
}

/**
 * Popover variant of `<Button>` — a button that reveals floating popover content beside it when clicked.
 * - The button is the primary element: it takes all the `ButtonVariants` styling props, and `className` lands on it (not the popover panel).
 * - The first element passed to `children` is the button label; the rest become the popover contents.
 *
 * DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 *
 * @returns A `Button` that toggles its attached `Popover` open and closed.
 * @example <PopoverButton>{label}{panel}</PopoverButton>
 * @kind component
 * @see https://shelving.cc/ui/PopoverButton
 */
export function PopoverButton({
	children: [buttonChildren, ...popoverChildren], //
	className,
	...props
}: PopoverButtonProps): ReactElement {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onClose={() => setOpen(false)}>
			<Button onClick={() => setOpen(!open)} {...props} className={className}>
				{buttonChildren}
			</Button>
			{popoverChildren}
		</Popover>
	);
}
