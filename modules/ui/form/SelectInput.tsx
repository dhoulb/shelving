import type { ReactElement } from "react";
import type { ChoiceOptions } from "../../schema/ChoiceSchema.js";
import { getProps } from "../../util/object.js";
import { getClass } from "../util/css.js";
import { getInputClass, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Props for `SelectInput`, a dropdown `<select>` bound to a string value.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SelectInput/SelectProps
 */
export interface SelectProps<T extends string> extends ValueInputProps<T> {
	/** The options for the select. */
	options: ChoiceOptions<T>;
}

/**
 * Dropdown input bound to a string value, rendered as a `<select>` of the provided `options`.
 * - Shows a placeholder empty option unless the field is required and already has a value.
 *
 * @param props Props including `options`, `value`, `onValue`, and `placeholder`.
 * @returns A `<select>` element.
 * @example <SelectInput name="role" options={ROLES} value={role} onValue={setRole} />
 * @see https://dhoulb.github.io/shelving/ui/form/SelectInput/SelectInput
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
}: SelectProps<string>): ReactElement {
	return (
		<select
			name={name}
			defaultValue={value}
			onChange={e => onValue(e.currentTarget.value || undefined)}
			className={getClass(getInputClass(), INPUT_CSS.select)}
			title={message}
			aria-invalid={!!message}
			disabled={disabled}
			required={required}
		>
			{!required || !value ? (
				<option value="" className={INPUT_CSS.empty}>
					{placeholder}
				</option>
			) : null}
			{getProps(options).map(([k, t]) => (
				<option key={k} value={k} className={INPUT_CSS.value}>
					{t}
				</option>
			))}
		</select>
	);
}
