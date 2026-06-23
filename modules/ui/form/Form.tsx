import type { ReactElement, ReactNode, SubmitEvent } from "react";
import { useInstance } from "../../react/useInstance.js";
import { useStore } from "../../react/useStore.js";
import type { DataSchema } from "../../schema/DataSchema.js";
import { isAsync } from "../../util/async.js";
import type { Data, PartialData } from "../../util/data.js";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import type { Arguments } from "../../util/function.js";
import { getIndentClass, type IndentVariants } from "../style/Indent.js";
import { getClass, getModuleClass } from "../util/css.js";
import { type NoticeCallback, notifySuccess, notifyThrown } from "../util/notice.js";
import type { OptionalChildProps } from "../util/props.js";
import styles from "./Form.module.css";
import { FormContext } from "./FormContext.js";
import { FormFields } from "./FormFields.js";
import { FormFooter } from "./FormFooter.js";
import { FormStore } from "./FormStore.js";

/**
 * Callback invoked when a `Form` is submitted with its validated data.
 * - Returned value (if defined) is notified to the user using `notifySuccess()`.
 * - Thrown value is notified to the user using `notifyError()`.
 *
 * @see https://shelving.cc/ui/FormCallback
 */
export type FormCallback<T extends Data> = (
	data: T,
	event: SubmitEvent<HTMLFormElement>,
) => ReactNode | void | PromiseLike<ReactNode | void>;

/**
 * Props for `Form`, the schema-driven form wrapper component.
 *
 * @see https://shelving.cc/ui/FormProps
 */
export interface FormProps<T extends Data> extends IndentVariants, OptionalChildProps {
	/** Schema for the form. */
	schema: DataSchema<T>;
	/** Initial data for the form. */
	data?: PartialData<T> | undefined;
	/** Content of the submit button. */
	submit?: ReactNode | undefined;
	/** Optional function called when the form is submitted. Takes the current (validated) value of the form, processes it (possibly asynchronously) and returns any new values to set in the form. */
	onSubmit?: FormCallback<T> | undefined;
	/** Initial set of messages for the form as either a dictionary or a string with `fieldName:` style messages. */
	messages?: ImmutableDictionary<string> | string | undefined;
}

/**
 * Schema-driven form that creates a `FormStore`, provides it via `FormContext`, and validates/submits on submit.
 * - Renders its fields and footer by default, or custom `children` that read the form via hooks.
 * - Closes a parent `<dialog>` automatically on successful submit.
 *
 * @returns A `<form>` element wrapping the fields in a `FormContext` provider.
 * @kind component
 * @example <Form schema={USER_SCHEMA} onSubmit={save} />
 * @see https://shelving.cc/ui/Form
 */
export function Form<T extends Data>(props: FormProps<T>): ReactElement;
export function Form({
	schema,
	data: initialData,
	onSubmit,
	submit,
	messages,
	children = (
		<>
			<FormFields />
			<FormFooter submit={submit} />
		</>
	),
	...props
}: FormProps<Data>): ReactElement {
	// Create a form store instance and subscribe to changes in it.
	const store = useStore(useInstance(FormStore, schema, initialData, messages));
	const busy = useStore(store.busy).value;

	return (
		<form
			id={store.id}
			key={store.key}
			onSubmit={async e => {
				// Stop the page reloading.
				e.preventDefault();

				// Get relevant elements.
				const form = e.currentTarget;
				const dialog = form.closest("dialog");

				// Submit the form to the callback.
				const result = await store.submit(callNotifiedForm, store, form, onSubmit, e);

				// Close the parent dialog on successful submit.
				if (result) dialog?.close();
			}}
			className={getClass(getModuleClass(styles, "form"), getIndentClass(props))}
			noValidate={true}
		>
			<fieldset className={getModuleClass(styles, "fieldset")} disabled={busy}>
				<FormContext value={store}>{children}</FormContext>
			</fieldset>
		</form>
	);
}

/**
 * Run a form submit callback and publish success/error notices based on its return or thrown value.
 * - Strings returned are shown as success notices; thrown values are routed through `notifyThrownForm()`.
 * - Async callbacks are awaited via `awaitNotifiedForm()`.
 *
 * @param value The validated form data passed to the callback.
 * @param store The `FormStore` the form is bound to.
 * @param form The underlying `HTMLFormElement` notices are anchored to.
 * @param callback Optional callback to run with the value and extra args.
 * @param args Additional arguments forwarded to the callback.
 * @returns `true` on success, `false` on failure (or a `Promise` resolving to one).
 * @example callNotifiedForm(data, store, formEl, onSubmit, event)
 * @see https://shelving.cc/ui/callNotifiedForm
 */
export function callNotifiedForm<T extends Data, A extends Arguments>(
	value: T,
	store: FormStore<T>,
	form: HTMLFormElement,
	callback?: NoticeCallback<[T, ...A]>,
	...args: A
): boolean | Promise<boolean> {
	try {
		const result = callback?.(value, ...args);
		if (isAsync(result)) return awaitNotifiedForm(store, form, result);
		if (result) notifySuccess(result, form);
		return true;
	} catch (thrown) {
		return notifyThrownForm(store, form, thrown);
	}
}

/**
 * Await a pending submit result and publish a success or error notice to a form once it settles.
 *
 * @param store The `FormStore` the form is bound to.
 * @param form The underlying `HTMLFormElement` notices are anchored to.
 * @param pending The pending result to await.
 * @returns A `Promise` resolving to `true` on success or `false` on failure.
 * @example await awaitNotifiedForm(store, formEl, pending)
 * @see https://shelving.cc/ui/awaitNotifiedForm
 */
export async function awaitNotifiedForm<T extends Data>(
	store: FormStore<T>,
	form: HTMLFormElement,
	pending: PromiseLike<ReactNode | undefined | void>,
): Promise<boolean> {
	try {
		const result = await pending;
		if (result) notifySuccess(result, form);
		return true;
	} catch (thrown) {
		return notifyThrownForm(store, form, thrown);
	}
}

/**
 * Notify the user about a value thrown during submit, storing string errors as form field messages.
 * - Assigning a string `reason` to the store splits it into per-field messages instead of a global notice.
 *
 * @param store The `FormStore` the thrown value is recorded on.
 * @param form The underlying `HTMLFormElement` notices are anchored to.
 * @param thrown The value thrown during submit.
 * @returns Always `false`, signalling the submit failed.
 * @example notifyThrownForm(store, formEl, thrown)
 * @see https://shelving.cc/ui/notifyThrownForm
 */
export function notifyThrownForm<T extends Data>(store: FormStore<T>, form: HTMLFormElement, thrown: unknown): false {
	store.reason = thrown;
	const reason = store.reason;
	if (reason) notifyThrown(reason, form);
	return false;
}
