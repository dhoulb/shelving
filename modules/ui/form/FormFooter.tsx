import type { ReactElement, ReactNode } from "react";
import { Footer } from "../block/Section.js";
import { Row } from "../style/Flex.js";
import type { OptionalChildProps } from "../util/props.js";
import { FormMessage } from "./FormMessage.js";
import { SubmitButton } from "./SubmitButton.js";

/**
 * Props for `FormFooter`, the submit-button-and-message footer for a form.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/FormFooter/FormFooterProps
 */
export interface FormFooterProps extends OptionalChildProps {
	submit?: ReactNode | undefined;
}

/**
 * Show a form footer with a submit button and the form's error message.
 * - Renders a row containing a `SubmitButton` (and any extra buttons passed as `children`).
 * - Renders a `<FormMessage>` beneath the buttons showing any error set on the form.
 *
 * @param props Props including footer `children` and custom `submit` button content.
 * @returns A footer element with the submit row and form message.
 * @example <FormFooter submit="Save" />
 * @see https://dhoulb.github.io/shelving/ui/form/FormFooter/FormFooter
 */
export function FormFooter({ children, submit }: FormFooterProps): ReactElement {
	return (
		<Footer>
			<Row reverse>
				<SubmitButton>{submit}</SubmitButton>
				{children}
			</Row>
			<FormMessage />
		</Footer>
	);
}
