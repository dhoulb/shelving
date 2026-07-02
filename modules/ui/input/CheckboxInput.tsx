import type { ReactElement } from "react";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

const INPUT_LABEL_CLASS = getModuleClass(INPUT_CSS, "label");

/**
 * Props for `CheckboxInput`, a boolean-valued checkbox input.
 *
 * @see https://shelving.cc/ui/CheckboxProps
 */
export interface CheckboxProps extends ValueInputProps<boolean>, OptionalChildProps, FlexVariants, InputVariants {}

/**
 * Checkbox input bound to a `boolean` value, rendered as a labelled `<input type="checkbox">`.
 * - The label content comes from `children`, falling back to `placeholder`/`title`.
 *
 * @returns A `<label>` wrapping the checkbox and its label content.
 * @example <CheckboxInput name="agree" value={agree} onValue={setAgree}>I agree</CheckboxInput>
 * @see https://shelving.cc/ui/CheckboxInput
 */
export function CheckboxInput({
	name,
	title,
	placeholder = title || "Yes",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children = placeholder,
	...props
}: CheckboxProps): ReactElement {
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
				type="checkbox"
				name={name}
				defaultChecked={!!value}
				onChange={e => onValue?.(!!e.currentTarget.checked)}
				disabled={disabled}
				required={required}
				title={message}
				aria-invalid={!!message}
			/>
			<span>{children}</span>
		</label>
	);
}
