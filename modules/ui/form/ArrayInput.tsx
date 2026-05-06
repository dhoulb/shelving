import { PlusIcon, XMarkIcon } from "@heroicons/react/24/solid";
import type { ReactElement } from "react";
import type { Schema } from "../../schema/Schema.js";
import { type ImmutableArray, omitArrayIndex, withArrayIndex } from "../../util/array.js";
import { splitMessage } from "../../util/error.js";
import { formatUnit } from "../../util/format.js";
import { Elements } from "../block/Elements.js";
import { Button } from "./Button.js";
import { Input, type ValueInputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";

export interface ArrayInputProps<T> extends ValueInputProps<ImmutableArray<T>> {
	one?: string;
	many?: string;
	min?: number | undefined;
	max?: number | undefined;
	/** Schema for the items in the repeater. */
	items: Schema<T>;
}

export function ArrayInput<T>(props: ArrayInputProps<T>): ReactElement;
export function ArrayInput({
	name,
	// title,
	placeholder,
	required = false,
	disabled = false,
	message = "",
	value = [],
	onValue,
	one = "item",
	many = `${one}s`,
	min = 0,
	max = Number.POSITIVE_INFINITY,
	items,
}: ArrayInputProps<unknown>): ReactElement {
	const messages = splitMessage(message);
	const length = value.length;
	const disableRemove = disabled || length <= min;
	const addNewItem = () => onValue([...value, items.value]);
	return (
		<Elements column>
			{length ? (
				value.map((v, i) => {
					const k = i.toString();
					return (
						<Elements key={k}>
							<SchemaInput
								name={k}
								schema={items}
								value={v}
								onValue={x => onValue(withArrayIndex(value, i, x))}
								message={messages[k]}
								disabled={disabled}
							/>
							<Button
								onClick={() => onValue(omitArrayIndex(value, i))}
								disabled={disableRemove}
								title={disableRemove ? `Minimum ${formatUnit(min, one, { unitDisplay: "long", one, many })}` : `Remove ${one}`}
							>
								<XMarkIcon />
							</Button>
						</Elements>
					);
				})
			) : (
				<Input onClick={addNewItem} name={name} required={required && min > 1} disabled={disabled}>
					{placeholder}
				</Input>
			)}
			<Elements>
				<Button //
					onClick={addNewItem}
					disabled={disabled || (typeof max === "number" && length >= max)}
					small
				>
					<PlusIcon /> Add {one}
				</Button>
				{length && min < 1 ? (
					<Button //
						onClick={() => onValue([])}
						small
					>
						<XMarkIcon /> Clear {many}
					</Button>
				) : null}
			</Elements>
		</Elements>
	);
}
