import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass, getModuleClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

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
			className={getClass(
				getInputClass(variants),
				getModuleClass(INPUT_CSS, "label"),
				getFlexClass(variants),
				hasChildren && getModuleClass(INPUT_CSS, "placeholder"),
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
