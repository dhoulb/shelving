import type { ReactElement } from "react";
import type { Schemas } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import { splitMessage } from "../../util/error.js";
import { getProps, withProp } from "../../util/object.js";
import { Elements } from "../block/Elements.js";
import type { ValueInputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";

export interface DataInputProps<T extends Data> extends ValueInputProps<T> {
	/** Schema for the sub-fields of this input. */
	props: Schemas<T>;
}

export function DataInput<T extends Data>(props: DataInputProps<T>): ReactElement;
export function DataInput({
	// name,
	// title,
	// placeholder,
	// required = false,
	// disabled = false,
	message = "",
	value = {},
	onValue,
	props,
}: DataInputProps<Data>): ReactElement {
	const messages = splitMessage(message);
	const entries = getProps(props);
	return (
		<Elements column={entries.length > 2}>
			{entries.map(([k, s]) => (
				<SchemaInput //
					key={k}
					name={k}
					schema={s}
					value={value[k]}
					onValue={x => onValue(withProp(value, k, x))}
					message={messages[k]}
				/>
			))}
		</Elements>
	);
}
