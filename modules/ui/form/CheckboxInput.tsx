import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

const INPUT_LABEL_CLASS = getModuleClass(INPUT_CSS, "label");
const INPUT_PLACEHOLDER_CLASS = getModuleClass(INPUT_CSS, "placeholder");

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
	placeholder = "Yes",
	required = false,
	disabled = false,
	message = "",
	value = false,
	onValue,
	children = title,
	...variants
}: CheckboxProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<label
			className={getClass(
				getInputClass(variants), //
				getFlexClass(variants),
				INPUT_LABEL_CLASS,
				!hasChildren && INPUT_PLACEHOLDER_CLASS,
			)}
			aria-invalid={!!message}
		>
			<input
				name={name}
				type="checkbox"
				defaultChecked={!!value}
				onChange={e => onValue?.(!!e.currentTarget.checked)}
				required={required}
				disabled={disabled}
				title={message}
				className={getModuleClass(INPUT_CSS, "radio")}
			/>
			<span>{hasChildren ? children : placeholder}</span>
		</label>
	);
}
