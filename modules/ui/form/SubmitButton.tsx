import { ArrowRightIcon } from "@heroicons/react/24/solid";
import type { ReactElement, ReactNode } from "react";
import { useStore } from "../../react/useStore.js";
import { Loading } from "../misc/Loading.js";
import { getStatusClass } from "../notice/Status.js";
import { getClass, getModuleClass } from "../util/css.js";
import { BUTTON_CSS, type ButtonVariants, ELEMENTS_BUTTON_CLASS } from "./Button.js";
import { requireForm } from "./FormContext.js";

/** <button> element that does an asyncronous form action (defaults to primary styling). */
export function SubmitButton({ children = SUBMIT_CHILDREN, strong = true, primary = true, ...variants }: SubmitButtonProps): ReactElement {
	const form = requireForm();
	const busy = useStore(form.busy).value;
	return (
		<button
			type="submit"
			disabled={busy}
			className={getClass(
				ELEMENTS_BUTTON_CLASS,
				getModuleClass(BUTTON_CSS, { strong, ...variants }),
				getStatusClass({ primary, ...variants }),
			)}
		>
			{busy ? <Loading /> : children}
		</button>
	);
}

export interface SubmitButtonProps extends ButtonVariants {
	children?: ReactNode | undefined;
}

const SUBMIT_CHILDREN = (
	<>
		Save
		<ArrowRightIcon />
	</>
);
