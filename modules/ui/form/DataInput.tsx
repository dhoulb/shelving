import type { ReactElement } from "react";
import type { Schemas } from "../../schema/Schema.js";
import type { Data } from "../../util/data.js";
import { splitMessage } from "../../util/error.js";
import { getProps, withProp } from "../../util/object.js";
import { Row } from "../style/Flex.js";
import type { ValueInputProps } from "./Input.js";
import { SchemaInput } from "./SchemaInput.js";

/**
 * Props for `DataInput`, a composite input that edits an object of schema-validated sub-fields.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/DataInput/DataInputProps
 */
export interface DataInputProps<T extends Data> extends ValueInputProps<T> {
	/** Schema for the sub-fields of this input. */
	props: Schemas<T>;
}

/**
 * Composite input that edits a data object by rendering a `SchemaInput` for each property schema.
 * - Each sub-field is keyed by its property name and validated using the matching schema in `props`.
 *
 * @returns Element rendering one input per property, laid out in a row or column.
 * @example <DataInput name="address" props={addressSchemas} value={address} onValue={setAddress} />
 * @see https://dhoulb.github.io/shelving/ui/form/DataInput/DataInput
 */
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
		<Row column={entries.length > 2}>
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
		</Row>
	);
}
