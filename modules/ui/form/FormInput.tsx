import type { ReactElement } from "react";
import { requireForm, useField } from "./FormContext.js";
import type { InputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";

/**
 * Props for `FormInput`, a bare `SchemaInput` bound to a named form field.
 *
 * @see https://shelving.cc/ui/FormInputProps
 */
export interface FormInputProps extends InputProps {}

/**
 * Show a `SchemaInput` for a single named property of the current form.
 * - Reads the field's value, schema, and message from the form context via `useField()`.
 *
 * @returns A `SchemaInput` bound to the named field.
 * @kind component
 * @example <FormInput name="email" />
 * @see https://shelving.cc/ui/FormInput
 */
export function FormInput({ name, ...props }: FormInputProps): ReactElement {
	const field = useField(name);
	return <SchemaInput {...field} {...props} />;
}

/**
 * Show a `SchemaInput` for every property in the current form's schema.
 *
 * @returns A fragment of `FormInput` elements, one per schema property.
 * @kind component
 * @example <FormInputs />
 * @see https://shelving.cc/ui/FormInputs
 */
export function FormInputs(): ReactElement {
	return (
		<>
			{Object.keys(requireForm().schema.props).map(name => (
				<FormInput key={name} name={name} />
			))}
		</>
	);
}
