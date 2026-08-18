/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import { type ReactElement, useState } from "react";
import { Button, type ButtonVariants } from "../button/Button.js";
import type { ClassProps } from "../util/props.js";
import { Popover, type PopoverChildren } from "./Popover.js";

/**
 * Props for `ButtonPopover`, a button that toggles an adjacent popover.
 *
 * @see https://shelving.cc/ui/ButtonPopoverProps
 */
export interface ButtonPopoverProps extends ButtonVariants, ClassProps {
	children: PopoverChildren;
}

/**
 * A button that, when clicked, shows a popover next to it when clicked or focused.
 * - The first element passed to `children` is used as the content for the button, the rest is the content of the popover.
 *
 * DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 *
 * @returns A `Popover` wrapping a `Button` that toggles it open and closed.
 * @example <ButtonPopover>{label}{panel}</ButtonPopover>
 * @see https://shelving.cc/ui/ButtonPopover
 */
export function ButtonPopover({
	children: [buttonChildren, ...popoverChildren], //
	className,
	...props
}: ButtonPopoverProps): ReactElement {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onClose={() => setOpen(false)} className={className}>
			<Button onClick={() => setOpen(!open)} {...props}>
				{buttonChildren}
			</Button>
			{popoverChildren}
		</Popover>
	);
}
