import { createContext } from "react";
import { useStore } from "../../react/useStore.js";
import type { Schema } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import type { AnyCaller } from "../../util/function.js";
import { requireContext } from "../util/context.js";
import type { FormStore } from "./FormStore.js";
import { isSchemaRequired, type SchemaInputProps } from "./SchemaInput.js";

/** Context for current form. */
export const FormContext = createContext<FormStore<Data> | undefined>(undefined);
FormContext.displayName = "FormContext";

/** Use the current form context. */
export function requireForm<T extends Data = Data>(caller?: AnyCaller): FormStore<T>;
export function requireForm(): FormStore<Data> {
	return requireContext(FormContext, requireForm);
}

/** Use the props for a field of a form. */
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
