import type { ReactElement, SyntheticEvent } from "react";
import type { StringInputType } from "../../schema/StringSchema.js";
import { PASSTHROUGH } from "../../util/function.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "../input/Input.js";
import { getClass, getModuleClass } from "../util/css.js";
import INPUT_CSS from "./Input.module.css";

/** Formats a string for display in a text input. */
export type TextFormatter = (str: string) => string;

/**
 * Props for `TextInput`, a single-line text input bound to a `string` value.
 *
 * @see https://shelving.cc/ui/TextInputProps
 */
export interface TextInputProps extends ValueInputProps<string>, InputVariants {
	input?: StringInputType;
	min?: number | undefined;
	max?: number | undefined;
	/** Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). */
	formatter?: TextFormatter | undefined;
}

/**
 * Single-line text input bound to a `string` value, rendered as an `<input>`. Use `TextareaInput` for multiline text.
 * - Applies an optional `formatter` on initial display and on blur — the raw typed value is published through `onValue`.
 *
 * @returns A text `<input>` element.
 * @example <TextInput name="name" value={name} onValue={setName} />
 * @see https://shelving.cc/ui/TextInput
 */
export function TextInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	input = "text",
	min = 0,
	max = Number.POSITIVE_INFINITY,
	formatter = PASSTHROUGH,
	className,
	...variants
}: TextInputProps): ReactElement {
	const onBlur = ({ currentTarget }: SyntheticEvent<HTMLInputElement>) => {
		currentTarget.value = formatter(currentTarget.value);
	};
	const onChange = (e: SyntheticEvent<HTMLInputElement>) => {
		onValue?.(e.currentTarget.value);
	};
	return (
		<input
			name={name}
			type={input}
			defaultValue={value !== undefined ? formatter(value) : ""}
			minLength={Number.isFinite(min) ? min : 0}
			maxLength={Number.isFinite(max) ? max : undefined}
			required={required && min > 0}
			disabled={disabled}
			placeholder={placeholder || " "}
			className={getClass(getInputClass(variants), getModuleClass(INPUT_CSS, "text"), className)}
			onChange={onChange}
			onBlur={onBlur}
			title={message}
			aria-invalid={!!message}
		/>
	);
}
