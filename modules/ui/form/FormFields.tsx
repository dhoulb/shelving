import type { ReactElement } from "react";
import { useStore } from "shelving/react";
import { Field } from "./Field.js";
import { requireForm, useField } from "./FormContext.js";
import type { InputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";

/** Show a `<Field>` for a named property in the current form. */
export function FormField({ name, ...props }: InputProps): ReactElement {
	const field = useField(name);
	const { schema, message } = field;

	return (
		<Field {...schema} message={message} required={props.required}>
			<SchemaInput {...field} {...props} />
		</Field>
	);
}

/** List of `<Field>` elements for every schema property in the current form. */
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
