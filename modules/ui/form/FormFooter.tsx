import type { ReactElement, ReactNode } from "react";
import { Flex } from "../block/Flex.js";
import { Footer } from "../block/Section.js";
import type { OptionalChildProps } from "../util/props.js";
import { FormMessage } from "./FormMessage.js";
import { SubmitButton } from "./SubmitButton.js";

export interface FormFooterProps extends OptionalChildProps {
	submit?: ReactNode | undefined;
}

/**
 * Show a form footer with custom submit text.
 * - Shows an elements row containing a submit button (and any additional buttons provided as `children`).
 * - Shows a `<FormMessage>` beneath the buttons that shows any error message set on the form.
 */
export function FormFooter({ children, submit }: FormFooterProps): ReactElement {
	return (
		<Footer>
			<Flex reverse>
				<SubmitButton>{submit}</SubmitButton>
				{children}
			</Flex>
			<FormMessage />
		</Footer>
	);
}
