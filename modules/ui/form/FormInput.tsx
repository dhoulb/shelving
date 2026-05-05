import type { ReactElement } from "react";
import { requireForm, useField } from "./FormContext.js";
import type { InputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";

export interface FormInputProps extends InputProps {}

/** Show a `SchemaInput` for each property in the current form. */
export function FormInput({ name, ...props }: FormInputProps): ReactElement {
	const field = useField(name);
	return <SchemaInput {...field} {...props} />;
}

/** Show a `SchemaInput` for a named property in the current form. */
export function FormInputs(): ReactElement {
	return (
		<>
			{Object.keys(requireForm().schema.props).map(name => (
				<FormInput key={name} name={name} />
			))}
		</>
	);
}
