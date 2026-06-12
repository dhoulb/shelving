import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { LABEL_INPUT_CLASS, PLACEHOLDER_CLASS, RADIO_CLASS, type ValueInputProps } from "./Input.js";

export interface RadioInputProps extends ValueInputProps<boolean>, OptionalChildProps, FlexVariants {}

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
	...props
}: RadioInputProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<label className={getClass(LABEL_INPUT_CLASS, getFlexClass(props), hasChildren && PLACEHOLDER_CLASS)}>
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
