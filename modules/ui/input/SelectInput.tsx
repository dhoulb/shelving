import type { ReactElement } from "react";
import type { ChoiceGroups, ChoiceOptions } from "../../schema/ChoiceSchema.js";
import { getProps } from "../../util/object.js";
import { getClass, getModuleClass } from "../util/css.js";
import { getInputClass, type InputVariants, type ValueInputProps } from "./Input.js";
import INPUT_CSS from "./Input.module.css";

/**
 * Props for `SelectInput`, a dropdown `<select>` bound to a string value.
 *
 * @see https://shelving.cc/ui/SelectProps
 */
export interface SelectProps<T extends string> extends ValueInputProps<T>, InputVariants {
	/** The options for the select. */
	options: ChoiceOptions<T>;
	/** Show the options under named headings, as `<optgroup>` elements. Options in no group show first. */
	groups?: ChoiceGroups<T> | undefined;
}

const OPTION_CLASS = getModuleClass(INPUT_CSS, "value");

/**
 * Dropdown input bound to a string value, rendered as a `<select>` of the provided `options`.
 * - Shows a placeholder empty option unless the field is required and already has a value.
 * - With `groups`, shows each group as an `<optgroup>`, after the options that are in no group. A group key that is not in `options` is skipped.
 *
 * @returns A `<select>` element.
 * @kind component
 * @example <SelectInput name="role" options={ROLES} value={role} onValue={setRole} />
 * @see https://shelving.cc/ui/SelectInput
 */
export function SelectInput<T extends string>(props: SelectProps<T>): ReactElement;
export function SelectInput({
	name,
	placeholder = "Choose...",
	required = false,
	disabled = false,
	message = "",
	value = "",
	onValue,
	options,
	groups,
	className,
	...variants
}: SelectProps<string>): ReactElement {
	const grouped = groups ? new Set(Object.values(groups).flat()) : undefined;
	return (
		<select
			name={name}
			defaultValue={value}
			onChange={e => onValue(e.currentTarget.value || undefined)}
			className={getClass(getInputClass(variants), getModuleClass(INPUT_CSS, "select"), className)}
			title={message}
			aria-invalid={!!message}
			disabled={disabled}
			required={required}
		>
			{!required || !value ? (
				<option value="" className={getModuleClass(INPUT_CSS, "empty")}>
					{placeholder}
				</option>
			) : null}
			{getProps(options).map(([k, t]) => (grouped?.has(k) ? null : _renderOption(k, t)))}
			{groups
				? Object.entries(groups).map(([g, keys]) => (
						<optgroup key={g} label={g}>
							{keys.map(k => _renderGroupOption(options, k))}
						</optgroup>
					))
				: null}
		</select>
	);
}

function _renderOption(key: string, title: string): ReactElement {
	return (
		<option key={key} value={key} className={OPTION_CLASS}>
			{title}
		</option>
	);
}

function _renderGroupOption(options: ChoiceOptions<string>, key: string): ReactElement | null {
	const title = options[key];
	return title === undefined ? null : _renderOption(key, title);
}
