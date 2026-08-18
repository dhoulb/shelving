/** biome-ignore-all lint/a11y/noStaticElementInteractions: This is fine we're only using this to listen for clicks on child buttons. */
/** biome-ignore-all lint/a11y/useKeyWithClickEvents: This is fine we're only using this to listen for clicks on child buttons. */

import { type ReactElement, useState } from "react";
import { ButtonInput } from "./ButtonInput.js";
import type { InputProps } from "./Input.js";
import { Popover, type PopoverChildren } from "./Popover.js";

/**
 * Props for `PopoverButtonInput` — the shared `InputProps`, plus `children` whose first node is the button label and the rest the popover contents.
 *
 * @see https://shelving.cc/ui/PopoverButtonInputProps
 */
export interface PopoverButtonInputProps extends InputProps {
	children: PopoverChildren;
}

/**
 * Popover variant of `<ButtonInput>` — an input-styled button that reveals floating popover content beside it when clicked.
 * - The button is the primary element: it takes the shared `InputProps`, and `className` lands on it (not the popover panel).
 * - The first element passed to `children` is the button label; the rest become the popover contents.
 *
 * DH: Would love to use new HTML `popover="auto"` functionality for this but the anchor positioning it needs is not supported everywhere yet.
 *
 * @returns A `ButtonInput` that toggles its attached `Popover` open and closed.
 * @example <PopoverButtonInput name="filter">{label}{panel}</PopoverButtonInput>
 * @kind component
 * @see https://shelving.cc/ui/PopoverButtonInput
 */
export function PopoverButtonInput({
	children: [buttonChildren, ...popoverChildren], //
	className,
	...props
}: PopoverButtonInputProps): ReactElement {
	const [open, setOpen] = useState(false);
	return (
		<Popover open={open} onClose={() => setOpen(false)}>
			<ButtonInput onClick={() => setOpen(!open)} {...props} className={className}>
				{buttonChildren}
			</ButtonInput>
			{popoverChildren}
		</Popover>
	);
}
