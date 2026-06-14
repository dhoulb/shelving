import type { ReactElement } from "react";
import { notNullish } from "../../util/null.js";
import { type FlexVariants, getFlexClass } from "../style/Flex.js";
import { getClass } from "../util/css.js";
import type { OptionalChildProps } from "../util/props.js";
import { LABEL_INPUT_CLASS, PLACEHOLDER_CLASS, RADIO_CLASS, type ValueInputProps } from "./Input.js";

/**
 * Props for `RadioInput`, a single labelled radio button styled as an input.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/RadioInput/RadioInputProps
 */
export interface RadioInputProps extends ValueInputProps<boolean>, OptionalChildProps, FlexVariants {}

/**
 * Single `<input type="radio">` wrapped in a `<label>` styled as an `<Input>`.
 * - Calls `onValue(true)` when selected; label content comes from `children`, falling back to `placeholder`/`title`.
 *
 * @param props Props including `value`, `onValue`, label `children`, and `Flex` variants.
 * @returns A `<label>` wrapping the radio button and its label content.
 * @example <RadioInput name="plan" value={isPro} onValue={selectPro}>Pro</RadioInput>
 * @see https://dhoulb.github.io/shelving/ui/form/RadioInput/RadioInput
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
