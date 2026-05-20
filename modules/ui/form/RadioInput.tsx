import type { ReactElement, ReactNode } from "react";
import { notNullish } from "../../util/null.js";
import { FLEX_LABEL_INPUT_CLASS, PLACEHOLDER_FLEX_LABEL_INPUT_CLASS, RADIO_CLASS, type ValueInputProps } from "./Input.js";

export interface RadioInputProps extends ValueInputProps<boolean> {
	children?: ReactNode | undefined;
}

/** A single `<input type="radio">` in a `<label>` wrapper styled as an `<Input>` */
export function RadioInput({
	name,
	title,
	placeholder = title || "Choose",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children,
}: RadioInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<label className={hasChildren ? FLEX_LABEL_INPUT_CLASS : PLACEHOLDER_FLEX_LABEL_INPUT_CLASS}>
			<input
				className={RADIO_CLASS}
				type="radio"
				name={name}
				defaultChecked={value}
				onChange={() => onValue(true)}
				disabled={disabled}
				required={required}
				aria-invalid={!!message}
			/>
			{hasChildren ? children : placeholder}
		</label>
	);
}
