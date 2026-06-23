import type { ReactElement } from "react";
import type { ChoiceOptions } from "../../schema/ChoiceSchema.js";
import { getProps } from "../../util/object.js";
import { getClass, getModuleClass } from "../util/css.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Props for `SelectInput`, a dropdown `<select>` bound to a string value.
 *
 * @see https://shelving.cc/ui/SelectProps
 */
export interface SelectProps<T extends string> extends ValueInputProps<T>, InputVariants {
	/** The options for the select. */
	options: ChoiceOptions<T>;
}

/**
 * Dropdown input bound to a string value, rendered as a `<select>` of the provided `options`.
 * - Shows a placeholder empty option unless the field is required and already has a value.
 *
 * @returns A `<select>` element.
 * @kind component
 * @example <SelectInput name="role" options={ROLES} value={role} onValue={setRole} />
 * @see https://shelving.cc/ui/SelectInput
 */
export function SelectInput<T extends string>(props: SelectProps<T>): ReactElement;
export function SelectInput({
	name,
	placeholder = "Choose...",
	required = false,
	disabled = false,
	message = "",
	value = "",
	onValue,
	options,
	...variants
}: SelectProps<string>): ReactElement {
	return (
		<select
			name={name}
			defaultValue={value}
			onChange={e => onValue(e.currentTarget.value || undefined)}
			className={getClass(getInputClass(variants), getModuleClass(INPUT_CSS, "select"))}
			title={message}
			aria-invalid={!!message}
			disabled={disabled}
			required={required}
		>
			{!required || !value ? (
				<option value="" className={getModuleClass(INPUT_CSS, "empty")}>
					{placeholder}
				</option>
			) : null}
			{getProps(options).map(([k, t]) => (
				<option key={k} value={k} className={getModuleClass(INPUT_CSS, "value")}>
					{t}
				</option>
			))}
		</select>
	);
}
