/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import { type ReactElement, useState } from "react";
import { Button, type ButtonVariants } from "./Button.js";
import { Popover, type PopoverChildren } from "./Popover.js";

/**
 * Props for `ButtonPopover`, a button that toggles an adjacent popover.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/ButtonPopover/ButtonPopoverProps
 */
export interface ButtonPopoverProps extends ButtonVariants {
	children: PopoverChildren;
}

/**
 * A button that, when clicked, shows a popover next to it when clicked or focused.
 * - The first element passed to `children` is used as the content for the button, the rest is the content of the popover.
 *
 * DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 *
 * @param props Props including `Button` variants and `children` whose first node is the button and the rest the popover.
 * @returns A `Popover` wrapping a `Button` that toggles it open and closed.
 * @example <ButtonPopover>{label}{panel}</ButtonPopover>
 * @see https://dhoulb.github.io/shelving/ui/form/ButtonPopover/ButtonPopover
 */
export function ButtonPopover({
	children: [buttonChildren, ...popoverChildren], //
	...props
}: ButtonPopoverProps): ReactElement {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onClose={() => setOpen(false)}>
			<Button onClick={() => setOpen(!open)} {...props}>
				{buttonChildren}
			</Button>
			{popoverChildren}
		</Popover>
	);
}
