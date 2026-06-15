import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { CHECKBOX_CLASS, getInputClass, type InputVariants, LABEL_CLASS, PLACEHOLDER_CLASS, type ValueInputProps } from "./Input.js";

/**
 * Props for `CheckboxInput`, a boolean-valued checkbox input.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/CheckboxInput/CheckboxProps
 */
export interface CheckboxProps extends ValueInputProps<boolean>, OptionalChildProps, FlexVariants, InputVariants {}

/**
 * Checkbox input bound to a `boolean` value, rendered as a labelled `<input type="checkbox">`.
 * - The label content comes from `children`, falling back to `placeholder`/`title`.
 *
 * @param props Props including `value`, `onValue`, label `children`, and `Flex` variants.
 * @returns A `<label>` wrapping the checkbox and its label content.
 * @example <CheckboxInput name="agree" value={agree} onValue={setAgree}>I agree</CheckboxInput>
 * @see https://dhoulb.github.io/shelving/ui/form/CheckboxInput/CheckboxInput
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
	children,
	...variants
}: CheckboxProps): ReactElement {
	const hasChildren = notNullish(children);
	return (
		<label
			className={getClass(getInputClass(variants), LABEL_CLASS, getFlexClass(variants), hasChildren && PLACEHOLDER_CLASS)}
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
				className={CHECKBOX_CLASS}
			/>
			<span>{hasChildren ? children : placeholder}</span>
		</label>
	);
}
