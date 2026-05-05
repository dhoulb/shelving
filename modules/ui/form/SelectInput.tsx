import type { ReactElement } from "react";
import { type ChoiceOptions, getProps } from "shelving";
import { EMPTY_OPTION_INPUT_CLASS, SELECT_INPUT_CLASS, VALUE_OPTION_INPUT_CLASS, type ValueInputProps } from "./Input.js";

export interface SelectProps<T extends string> extends ValueInputProps<T> {
	/** The options for the select. */
	options: ChoiceOptions<T>;
}

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
			className={SELECT_INPUT_CLASS}
			title={message}
			aria-invalid={!!message}
			disabled={disabled}
			required={required}
		>
			{!required || !value ? (
				<option value="" className={EMPTY_OPTION_INPUT_CLASS}>
					{placeholder}
				</option>
			) : null}
			{getProps(options).map(([k, t]) => (
				<option key={k} value={k} className={VALUE_OPTION_INPUT_CLASS}>
					{t}
				</option>
			))}
		</select>
	);
}
