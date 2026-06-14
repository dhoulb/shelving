import { createContext } from "react";
import { useStore } from "../../react/useStore.js";
import type { Schema } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import type { AnyCaller } from "../../util/function.js";
import { requireContext } from "../util/context.js";
import type { FormStore } from "./FormStore.js";
import { isSchemaRequired, type SchemaInputProps } from "./SchemaInput.js";

/**
 * React context holding the current `FormStore`, provided by the `Form` component.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/FormContext/FormContext
 */
export const FormContext = createContext<FormStore<Data> | undefined>(undefined);
FormContext.displayName = "FormContext";

/**
 * Hook that returns the current form's `FormStore` from context.
 *
 * @param caller Function to attribute the error to if no form context is found.
 * @returns The current `FormStore` instance.
 * @throws `RequiredError` if called outside a `Form` component.
 * @example const form = requireForm();
 * @see https://dhoulb.github.io/shelving/ui/form/FormContext/requireForm
 */
export function requireForm<T extends Data = Data>(caller?: AnyCaller): FormStore<T>;
export function requireForm(): FormStore<Data> {
	return requireContext(FormContext, requireForm);
}

/**
 * Hook that returns the input props for a single named field of a form.
 * - Subscribes to the form store so the field re-renders when its value or message changes.
 *
 * @param name Name of the field to read props for.
 * @param form Form store to read from, defaulting to the current form context.
 * @returns Props (`name`, `schema`, `value`, `onValue`, `message`, `required`) ready to spread onto an input.
 * @example const field = useField("email");
 * @see https://dhoulb.github.io/shelving/ui/form/FormContext/useField
 */
export function useField<T, I = never>(name: string, form?: FormStore<{ [name: string]: T }>): SchemaInputProps<Schema<T>, I>;
export function useField(name: string, form: FormStore<Data> = requireForm(useField)): SchemaInputProps<Schema<unknown>> {
	useStore(form);
	const schema = form.requireSchema(name);
	return {
		name,
		schema,
		onValue: v => form.publish(name, v),
		value: form.get(name) ?? schema.value,
		message: useStore(form.messages).get(name),
		required: isSchemaRequired(schema),
	};
}
