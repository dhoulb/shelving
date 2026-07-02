import type { ReactElement } from "react";
import { useStore } from "../../react/useStore.js";
import type { InputProps } from "../input/Input.js";
import { SchemaInput } from "../input/SchemaInput.js";
import { Field } from "./Field.js";
import { requireForm, useField } from "./FormContext.js";

/**
 * Show a `<Field>` (label, input, and message) for a single named property of the current form.
 *
 * @returns A `<Field>` wrapping a `SchemaInput` bound to the named field.
 * @kind component
 * @example <FormField name="email" />
 * @see https://shelving.cc/ui/FormField
 */
export function FormField({ name, ...props }: InputProps): ReactElement {
	const field = useField(name);
	const { schema, message } = field;

	return (
		<Field {...schema} message={message} required={props.required}>
			<SchemaInput {...field} {...props} />
		</Field>
	);
}

/**
 * Show a `<Field>` for every property in the current form's schema.
 *
 * @returns A fragment of `FormField` elements, one per schema property.
 * @kind component
 * @example <FormFields />
 * @see https://shelving.cc/ui/FormFields
 */
export function FormFields(): ReactElement {
	const form = useStore(requireForm());
	return (
		<>
			{Object.keys(form.schema.props).map(name => (
				<FormField key={name} name={name} />
			))}
		</>
	);
}
