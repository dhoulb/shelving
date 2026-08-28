import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { requireForm } from "../form/FormContext.js";
import { LOADING } from "../misc/Loading.js";
import { getClass } from "../util/css.js";
import type { ClassProps, OptionalChildProps } from "../util/props.js";
import { type ButtonVariants, getButtonClass } from "./Button.js";

/**
 * Component props for `<SubmitButton>`, a form submit button.
 *
 * @property children - The content of the button. Defaults to `"Save"` with a right-pointing arrow icon.
 * @property color - The color variant of the button. Defaults to `"primary"`
 *
 * @see https://shelving.cc/ui/SubmitButtonProps
 */
export interface SubmitButtonProps extends ButtonVariants, OptionalChildProps, ClassProps {}

const _SUBMIT_CHILDREN = (
	<>
		Save
		<ArrowRightIcon />
	</>
);

/**
 * Submit button for a form that disables itself and shows a spinner while the form is busy.
 * - Defaults to full-width, primary styling and a "Save" label.
 *
 * @returns A `<button type="submit">` element bound to the current form.
 * @example <SubmitButton>Save changes</SubmitButton>
 * @see https://shelving.cc/ui/SubmitButton
 */
export function SubmitButton({
	children = _SUBMIT_CHILDREN,
	color = "primary",
	full = true,
	className,
	...props
}: SubmitButtonProps): ReactElement {
	const form = requireForm();
	const busy = useStore(form.busy).value;
	return (
		<button type="submit" disabled={busy} className={getClass(getButtonClass({ color, full, ...props }), className)}>
			{busy ? LOADING : children}
		</button>
	);
}
