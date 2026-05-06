import type { ReactElement, ReactNode } from "react";
import { notNullish } from "../../util/null.js";
import { CHECKBOX_CLASS, ELEMENTS_LABEL_INPUT_CLASS, type ValueInputProps } from "./Input.js";

export interface CheckboxProps extends ValueInputProps<boolean> {
	children?: ReactNode | undefined;
}

/** Checkbox element. */
export function CheckboxInput({
	name,
	title,
	placeholder = title || "Yes",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children,
}: CheckboxProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<label className={ELEMENTS_LABEL_INPUT_CLASS} aria-invalid={!!message}>
			<input
				name={name}
				type="checkbox"
				defaultChecked={!!value}
				onChange={e => onValue?.(!!e.currentTarget.checked)}
				required={required}
				disabled={disabled}
				title={message}
				className={CHECKBOX_CLASS}
			/>
			<span>{hasChildren ? children : placeholder}</span>
		</label>
	);
}
