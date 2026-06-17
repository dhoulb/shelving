/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import { type ReactElement, useState } from "react";
import { ButtonInput } from "./ButtonInput.js";
import type { InputProps } from "./Input.js";
import { Popover, type PopoverChildren } from "./Popover.js";

/**
 * Props for `ButtonInputPopover`, an input button that toggles an adjacent popover.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/ButtonInputPopover/ButtonInputPopoverProps
 */
export interface ButtonInputPopoverProps extends InputProps {
	children: PopoverChildren;
}

/**
 * An input button that, when clicked, shows a popover next to it when clicked or focused.
 * - The first element passed to `children` is used as the content for the button, the rest is the content of the popover.
 *
 * DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 *
 * @returns A `Popover` wrapping a `ButtonInput` that toggles it open and closed.
 * @example <ButtonInputPopover name="filter">{label}{panel}</ButtonInputPopover>
 * @see https://dhoulb.github.io/shelving/ui/form/ButtonInputPopover/ButtonInputPopover
 */
export function ButtonInputPopover({
	children: [buttonChildren, ...popoverChildren], //
	...props
}: ButtonInputPopoverProps): ReactElement {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onClose={() => setOpen(false)}>
			<ButtonInput onClick={() => setOpen(!open)} {...props}>
				{buttonChildren}
			</ButtonInput>
			{popoverChildren}
		</Popover>
	);
}
