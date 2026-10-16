import type { CSSProperties, ReactElement, SyntheticEvent } from "react";
import { PASSTHROUGH } from "../../util/function.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "../input/Input.js";
import { getClass, getModuleClass } from "../util/css.js";
import INPUT_CSS from "./Input.module.css";
import type { TextFormatter } from "./TextInput.js";

/**
 * Props for `TextareaInput`, a multiline text input bound to a `string` value.
 *
 * @see https://shelving.cc/ui/TextareaInputProps
 */
export interface TextareaInputProps extends ValueInputProps<string>, InputVariants {
	/**
	 * Rows the textarea shows at first (its minimum height). It grows to fit its content.
	 * @default 2
	 */
	rows?: number | undefined;
	min?: number | undefined;
	max?: number | undefined;
	/** Optional formatter — when provided the value is reformatted on blur and when initially displayed (the value published through `onValue` is never formatted). */
	formatter?: TextFormatter | undefined;
}

/**
 * Multiline text input bound to a `string` value, rendered as a `<textarea>` that grows to fit its content.
 * - Applies an optional `formatter` on initial display and on blur — the raw typed value is published through `onValue`.
 *
 * @returns A `<textarea>` element.
 * @example <TextareaInput name="bio" rows={4} value={bio} onValue={setBio} />
 * @see https://shelving.cc/ui/TextareaInput
 */
export function TextareaInput({
	name,
	title = "",
	placeholder = title, // Placeholder must be defined or `:placeholder-shown` CSS rules won't show.
	required = false,
	disabled = false,
	message = "",
	value,
	onValue,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	rows = 2,
	formatter = PASSTHROUGH,
	className,
	...variants
}: TextareaInputProps): ReactElement {
	const onBlur = ({ currentTarget }: SyntheticEvent<HTMLTextAreaElement>) => {
		currentTarget.value = formatter(currentTarget.value);
	};
	const onChange = (e: SyntheticEvent<HTMLTextAreaElement>) => {
		onValue?.(e.currentTarget.value);
		_resize(e.currentTarget, rows);
	};
	return (
		<textarea
			ref={el => void (el && _resize(el, rows))}
			name={name}
			defaultValue={value !== undefined ? formatter(value) : ""}
			minLength={Number.isFinite(min) ? min : 0}
			maxLength={Number.isFinite(max) ? max : undefined}
			rows={rows}
			style={{ "--input-rows": rows } as CSSProperties}
			required={required && min > 0}
			disabled={disabled}
			placeholder={placeholder || " "}
			className={getClass(getInputClass(variants), getModuleClass(INPUT_CSS, "text"), getModuleClass(INPUT_CSS, "multiline"), className)}
			onChange={onChange}
			onBlur={onBlur}
			title={message}
			aria-invalid={!!message}
		/>
	);
}

/**
 * @todo This can be removed when Firefox supports `field-sizing:` in CSS.
 *   https://caniuse.com/wf-field-sizing
 */
function _resize(el: HTMLTextAreaElement, minRows: number): void {
	if (el && !CSS.supports("field-sizing", "content")) {
		el.rows = minRows;
		while (el.scrollHeight > el.clientHeight) el.rows++;
	}
}
