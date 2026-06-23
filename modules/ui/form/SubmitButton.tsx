import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Loading } from "../misc/Loading.js";
import type { OptionalChildProps } from "../util/props.js";
import { type ButtonVariants, getButtonClass } from "./Button.js";
import { requireForm } from "./FormContext.js";

/**
 * Submit button for a form that disables itself and shows a spinner while the form is busy.
 * - Defaults to strong, full-width, primary styling and a "Save" label.
 *
 * @returns A `<button type="submit">` element bound to the current form.
 * @example <SubmitButton>Save changes</SubmitButton>
 * @see https://shelving.cc/ui/SubmitButton
 */
export function SubmitButton({
	children = SUBMIT_CHILDREN,
	strong = true,
	color = "primary",
	full = true,
	...variants
}: SubmitButtonProps): ReactElement {
	const form = requireForm();
	const busy = useStore(form.busy).value;
	return (
		<button type="submit" disabled={busy} className={getButtonClass({ strong, color, full, ...variants })}>
			{busy ? <Loading /> : children}
		</button>
	);
}

/**
 * Props for `SubmitButton`, a form submit button.
 *
 * @see https://shelving.cc/ui/SubmitButtonProps
 */
export interface SubmitButtonProps extends ButtonVariants, OptionalChildProps {}

const SUBMIT_CHILDREN = (
	<>
		Save
		<ArrowRightIcon />
	</>
);
