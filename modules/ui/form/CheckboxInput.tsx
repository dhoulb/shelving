import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { CHECKBOX_CLASS, LABEL_INPUT_CLASS, PLACEHOLDER_CLASS, type ValueInputProps } from "./Input.js";

export interface CheckboxProps extends ValueInputProps<boolean>, OptionalChildProps, FlexVariants {}

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
	...variants
}: CheckboxProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<label className={getClass(LABEL_INPUT_CLASS, getFlexClass(variants), hasChildren && PLACEHOLDER_CLASS)} aria-invalid={!!message}>
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
