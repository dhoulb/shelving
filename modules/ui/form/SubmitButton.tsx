import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import { Loading } from "../misc/Loading.js";
import type { OptionalChildProps } from "../util/props.js";
import { type ButtonVariants, getButtonClass } from "./Button.js";
import { requireForm } from "./FormContext.js";

/** `<button>` element that does an asynchronous form action (defaults to strong, full-width, primary styling). */
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

export interface SubmitButtonProps extends ButtonVariants, OptionalChildProps {}

const SUBMIT_CHILDREN = (
	<>
		Save
		<ArrowRightIcon />
	</>
);
