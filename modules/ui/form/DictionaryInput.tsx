import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { ReactElement } from "react";
import type { Schema } from "../../schema/Schema.js";
import type { ImmutableDictionary } from "../../util/dictionary.js";
import { omitDictionaryItem, withDictionaryItem } from "../../util/dictionary.js";
import { splitMessage } from "../../util/error.js";
import { formatUnit } from "../../util/format.js";
import { omitProp } from "../../util/object.js";
import { Row } from "../style/Flex.js";
import { Button } from "./Button.js";
import { ButtonInput } from "./ButtonInput.js";
import type { ValueInputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";
import { TextInput } from "./TextInput.js";

/**
 * Props for `DictionaryInput`, a repeating input that edits a dictionary of schema-validated items.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/DictionaryInput/DictionaryInputProps
 */
export interface DictionaryInputProps<T> extends ValueInputProps<ImmutableDictionary<T>> {
	one?: string;
	many?: string;
	min?: number | undefined;
	max?: number | undefined;
	/** Schema for the items in the repeater. */
	items: Schema<T>;
}

/**
 * Repeating input that edits a dictionary, with an editable key and schema-validated value per entry.
 * - Each value is validated and rendered using the supplied `items` schema.
 * - Enforces `min`/`max` entry count and offers add, remove, and clear controls.
 *
 * @returns Element rendering one key/value row per entry plus add/clear controls.
 * @example <DictionaryInput name="meta" items={STRING} value={meta} onValue={setMeta} />
 * @see https://dhoulb.github.io/shelving/ui/form/DictionaryInput/DictionaryInput
 */
export function DictionaryInput<T>(props: DictionaryInputProps<T>): ReactElement;
export function DictionaryInput({
	name,
	// title,
	placeholder,
	required = false,
	disabled = false,
	message = "",
	value = {},
	onValue,
	one = "item",
	many = `${one}s`,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	items,
}: DictionaryInputProps<unknown>): ReactElement {
	const messages = splitMessage(message);
	const length = Object.keys(value).length;
	const disableRemove = disabled || length <= min;
	const addNewItem = () => onValue({ ...value, [one]: items.value });
	return (
		<Row column>
			{length ? (
				Object.entries(value).map(([k, v], i) => {
					const r = i.toString();
					const message = messages[r];
					return (
						<Row key={r}>
							<TextInput
								name={`${r}-key`}
								value={k}
								onValue={x => {
									// Delete the dictionary item with `currentKey` and add a new one with `nextKey`
									if (!x || x === k) return;
									onValue(withDictionaryItem(omitDictionaryItem(value, k), x, v));
									k = x; // Update this so it works until content is re-rendered.
								}}
								message={message}
								disabled={disabled}
							/>
							<SchemaInput
								name={`${r}-value`}
								schema={items}
								value={v}
								onValue={x => onValue(withDictionaryItem(value, k, x))}
								message={message}
								disabled={disabled}
							/>
							<Button
								onClick={() => onValue(omitProp(value, k))}
								disabled={disableRemove}
								title={disableRemove ? `Minimum ${formatUnit(min, one, { unitDisplay: "long", one, many })}` : `Remove ${one}`}
							>
								<XMarkIcon />
							</Button>
						</Row>
					);
				})
			) : (
				<ButtonInput onClick={addNewItem} name={name} required={required && min > 1} disabled={disabled}>
					{placeholder}
				</ButtonInput>
			)}
			<Row>
				<Button //
					onClick={addNewItem}
					disabled={disabled || (typeof max === "number" && length >= max)}
					small
				>
					<PlusIcon /> Add {one}
				</Button>
				{length && min < 1 ? (
					<Button //
						onClick={() => onValue({})}
						small
					>
						<XMarkIcon /> Clear {many}
					</Button>
				) : null}
			</Row>
		</Row>
	);
}
