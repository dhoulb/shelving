import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { requireForm } from "../form/FormContext.js";
import { LOADING } from "../misc/Loading.js";
import type { OptionalChildProps } from "../util/props.js";
import { type ButtonVariants, getButtonClass } from "./Button.js";

/**
 * Component props for `<SubmitButton>`, a form submit button.
 *
 * @property children - The content of the button. Defaults to `"Save"` with a right-pointing arrow icon.
 * @property strong - Whether the button should have strong styling. Defaults to `true`
 * @property color - The color variant of the button. Defaults to `"primary"`
 *
 * @see https://shelving.cc/ui/SubmitButtonProps
 */
export interface SubmitButtonProps extends ButtonVariants, OptionalChildProps {}

const _SUBMIT_CHILDREN = (
	<>
		Save
		<ArrowRightIcon />
	</>
);

/**
 * Submit button for a form that disables itself and shows a spinner while the form is busy.
 * - Defaults to strong, full-width, primary styling and a "Save" label.
 *
 * @returns A `<button type="submit">` element bound to the current form.
 * @example <SubmitButton>Save changes</SubmitButton>
 * @see https://shelving.cc/ui/SubmitButton
 */
export function SubmitButton({
	children = _SUBMIT_CHILDREN,
	strong = true,
	color = "primary",
	full = true,
	...props
}: SubmitButtonProps): ReactElement {
	const form = requireForm();
	const busy = useStore(form.busy).value;
	return (
		<button type="submit" disabled={busy} className={getButtonClass({ strong, color, full, ...props })}>
			{busy ? LOADING : children}
		</button>
	);
}
