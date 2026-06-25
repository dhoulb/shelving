import type { ReactElement } from "react";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

const INPUT_LABEL_CLASS = getModuleClass(INPUT_CSS, "label");
const INPUT_PLACEHOLDER_CLASS = getModuleClass(INPUT_CSS, "placeholder");

/**
 * Props for `RadioInput`, a single labelled radio button styled as an input.
 *
 * @see https://shelving.cc/ui/RadioInputProps
 */
export interface RadioInputProps extends ValueInputProps<boolean>, OptionalChildProps, FlexVariants, InputVariants {}

/**
 * Single `<input type="radio">` wrapped in a `<label>` styled as an `<Input>`.
 * - Calls `onValue(true)` when selected; label content comes from `children`, falling back to `placeholder`/`title`.
 *
 * @returns A `<label>` wrapping the radio button and its label content.
 * @example <RadioInput name="plan" value={isPro} onValue={selectPro}>Pro</RadioInput>
 * @see https://shelving.cc/ui/RadioInput
 */
export function RadioInput({
	name,
	title,
	placeholder = title || "Choose",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children = placeholder,
	...props
}: RadioInputProps): ReactElement {
	return (
		<label
			className={getClass(
				getInputClass(props), //
				getFlexClass(props),
				INPUT_LABEL_CLASS,
			)}
		>
			<input
				className={getModuleClass(INPUT_CSS, "radio")}
				type="radio"
				name={name}
				defaultChecked={!!value}
				onChange={() => onValue(true)}
				disabled={disabled}
				required={required}
				title={message}
				aria-invalid={!!message}
			/>
			<span>{children}</span>
		</label>
	);
}
