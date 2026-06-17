import type { ReactElement } from "react";
import { UnexpectedError } from "../../error/UnexpectedError.js";
import { ArraySchema } from "../../schema/ArraySchema.js";
import { BooleanSchema } from "../../schema/BooleanSchema.js";
import { ChoiceSchema } from "../../schema/ChoiceSchema.js";
import { DataSchema } from "../../schema/DataSchema.js";
import { DateSchema } from "../../schema/DateSchema.js";
import { DictionarySchema } from "../../schema/DictionarySchema.js";
import { NullableSchema } from "../../schema/NullableSchema.js";
import { NumberSchema } from "../../schema/NumberSchema.js";
import { OptionalSchema } from "../../schema/OptionalSchema.js";
import type { Schema } from "../../schema/Schema.js";
import { StringSchema } from "../../schema/StringSchema.js";
import { isArray } from "../../util/array.js";
import { type Data, isData } from "../../util/data.js";
import { isDictionary } from "../../util/dictionary.js";
import { getNumber } from "../../util/number.js";
import { getKeys } from "../../util/object.js";
import { getSource, requireSource } from "../../util/source.js";
import { getString } from "../../util/string.js";
import type { ValidatorType } from "../../util/validate.js";
import type { OptionalChildProps } from "../util/props.js";
import { ArrayInput } from "./ArrayInput.js";
import { CheckboxInput } from "./CheckboxInput.js";
import { ChoiceRadioInputs } from "./ChoiceRadioInputs.js";
import { DataInput } from "./DataInput.js";
import { DateInput } from "./DateInput.js";
import { DictionaryInput } from "./DictionaryInput.js";
import { Field } from "./Field.js";
import type { ValueInputProps } from "./Input.js";
import { NumberInput } from "./NumberInput.js";
import { SelectInput } from "./SelectInput.js";
import { TextInput } from "./TextInput.js";

/**
 * Whether a schema is required, i.e. not wrapped in an [`OptionalSchema`](/schema/OptionalSchema) or [`NullableSchema`](/schema/NullableSchema).
 *
 * @param schema The schema to test.
 * @returns `true` if the schema is required, `false` if it is optional or nullable.
 * @example isSchemaRequired(STRING) // true
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/isSchemaRequired
 */
export function isSchemaRequired(schema: Schema): boolean {
	return !(schema instanceof OptionalSchema || schema instanceof NullableSchema);
}

/**
 * Props for `SchemaInput` and its variants: a `schema` plus the value input props it drives.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/SchemaInputProps
 */
export interface SchemaInputProps<T extends Schema, I = never> extends ValueInputProps<ValidatorType<T>, I> {
	schema: T;
}

/**
 * Show the appropriate input control for a schema, dispatching on the schema's concrete type.
 * - Picks [`DateInput`](/ui/DateInput), [`NumberInput`](/ui/NumberInput), choice radios/select, [`CheckboxInput`](/ui/CheckboxInput), [`TextInput`](/ui/TextInput), [`ArrayInput`](/ui/ArrayInput), [`DictionaryInput`](/ui/DictionaryInput), or [`DataInput`](/ui/DataInput).
 * - `required` defaults to whether the schema is required.
 *
 * @returns The matching input element for the schema.
 * @throws [`UnexpectedError`](/error/UnexpectedError) if no input matches the schema type.
 * @kind component
 * @example <SchemaInput name="email" schema={EMAIL} /> // Outputs a `<TextInput>` for the "email" property.
 * @example <SchemaInput name="age" schema={AGE} /> // Outputs a `<NumberInput>` for the "age" property.
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/SchemaInput
 */
export function SchemaInput<T extends Schema>(props: SchemaInputProps<T>): ReactElement;
export function SchemaInput({
	name,
	schema,
	/**
	 * Required defaults to whether the schema is required
	 * - A schema is required if it's not wrapped in an [`OptionalSchema`](/schema/OptionalSchema) or [`NullableSchema`](/schema/NullableSchema)
	 * - Can be overridden by explicitly settings `<SchemaInput required>`
	 */
	required = isSchemaRequired(schema),
	...props
}: SchemaInputProps<Schema, unknown>): ReactElement {
	const date = getSource(DateSchema, schema);
	if (date) return <DateSchemaInput name={name} schema={date} required={required} {...props} />;

	const number = getSource(NumberSchema, schema);
	if (number) return <NumberSchemaInput name={name} schema={number} required={required} {...props} />;

	const choice = getSource(ChoiceSchema, schema);
	if (choice) return <ChoiceSchemaInput name={name} schema={choice} required={required} {...props} />;

	const boolean = getSource(BooleanSchema, schema);
	if (boolean) return <BooleanSchemaInput name={name} schema={boolean} required={required} {...props} />;

	const string = getSource(StringSchema, schema);
	if (string) return <StringSchemaInput name={name} schema={string} required={required} {...props} />;

	const array = getSource(ArraySchema, schema);
	if (array) return <ArraySchemaInput name={name} schema={array} required={required} {...props} />;

	const dict = getSource(DictionarySchema, schema);
	if (dict) return <DictionarySchemaInput name={name} schema={dict} required={required} {...props} />;

	const data = getSource(DataSchema, schema);
	if (data) return <DataSchemaInput name={name} schema={data} required={required} {...props} />;

	throw new UnexpectedError(`Schema "${name}" has no corresponding form field`, { name, schema });
}

/**
 * Props for `DateSchemaInput`, the [`DateSchema`](/schema/DateSchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/DateSchemaInputProps
 */
export interface DateSchemaInputProps extends SchemaInputProps<DateSchema, unknown> {}

/**
 * Show a [`DateInput`](/ui/DateInput) for a [`DateSchema`](/schema/DateSchema).
 *
 * @returns A `DateInput` element bound to the schema.
 * @example <DateSchemaInput name="dob" schema={DATE} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/DateSchemaInput
 */
export function DateSchemaInput({ schema, value, ...props }: DateSchemaInputProps): ReactElement {
	return <DateInput {...schema} value={getString(value)} {...props} />;
}

/**
 * Props for `NumberSchemaInput`, the [`NumberSchema`](/schema/NumberSchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/NumberSchemaInputProps
 */
export interface NumberSchemaInputProps extends SchemaInputProps<NumberSchema, unknown> {}

/**
 * Show a [`NumberInput`](/ui/NumberInput) for a [`NumberSchema`](/schema/NumberSchema), formatting values with the schema's `format()`.
 *
 * @returns A `NumberInput` element bound to the schema.
 * @example <NumberSchemaInput name="age" schema={NUMBER} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/NumberSchemaInput
 */
export function NumberSchemaInput({ schema, value, ...props }: NumberSchemaInputProps): ReactElement {
	return <NumberInput {...schema} value={getNumber(value)} formatter={num => schema.format(num)} {...props} />;
}

/**
 * Props for `ChoiceSchemaInput`, the [`ChoiceSchema`](/schema/ChoiceSchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/ChoiceSchemaInputProps
 */
export interface ChoiceSchemaInputProps extends SchemaInputProps<ChoiceSchema<string>, unknown> {}

/**
 * Show a choice input for a [`ChoiceSchema`](/schema/ChoiceSchema) — radio inputs for up to 8 options, otherwise a select.
 *
 * @returns A [`ChoiceRadioInputs`](/ui/ChoiceRadioInputs) or [`SelectInput`](/ui/SelectInput) element bound to the schema.
 * @example <ChoiceSchemaInput name="role" schema={ROLE} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/ChoiceSchemaInput
 */
export function ChoiceSchemaInput({ schema, value, ...props }: ChoiceSchemaInputProps): ReactElement {
	const { options } = requireSource(ChoiceSchema, schema);
	if (getKeys(options).length <= 8) return <ChoiceRadioInputs {...schema} value={getString(value)} {...props} />;
	return <SelectInput {...schema} value={getString(value)} {...props} />;
}

/**
 * Props for `BooleanSchemaInput`, the [`BooleanSchema`](/schema/BooleanSchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/BooleanSchemaInputProps
 */
export interface BooleanSchemaInputProps extends SchemaInputProps<BooleanSchema, unknown> {}

/**
 * Show a [`CheckboxInput`](/ui/CheckboxInput) for a [`BooleanSchema`](/schema/BooleanSchema).
 *
 * @returns A `CheckboxInput` element bound to the schema.
 * @example <BooleanSchemaInput name="agree" schema={BOOLEAN} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/BooleanSchemaInput
 */
export function BooleanSchemaInput({ schema, value, ...props }: BooleanSchemaInputProps): ReactElement {
	return <CheckboxInput {...schema} value={!!value} {...props} />;
}

/**
 * Props for `StringSchemaInput`, the [`StringSchema`](/schema/StringSchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/StringSchemaInputProps
 */
export interface StringSchemaInputProps extends SchemaInputProps<StringSchema, unknown> {}

/**
 * Show a [`TextInput`](/ui/TextInput) for a [`StringSchema`](/schema/StringSchema), sanitising and formatting values with the schema.
 *
 * @returns A `TextInput` element bound to the schema.
 * @example <StringSchemaInput name="email" schema={EMAIL} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/StringSchemaInput
 */
export function StringSchemaInput({ schema, value, ...props }: StringSchemaInputProps): ReactElement {
	return <TextInput {...schema} value={getString(value)} formatter={str => schema.format(schema.sanitize(str))} {...props} />;
}

/**
 * Props for `ArraySchemaInput`, the [`ArraySchema`](/schema/ArraySchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/ArraySchemaInputProps
 */
export interface ArraySchemaInputProps extends SchemaInputProps<ArraySchema<unknown>, unknown> {}

/**
 * Show an [`ArrayInput`](/ui/ArrayInput) for an [`ArraySchema`](/schema/ArraySchema).
 *
 * @returns An `ArrayInput` element bound to the schema.
 * @example <ArraySchemaInput name="tags" schema={TAGS} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/ArraySchemaInput
 */
export function ArraySchemaInput({ schema, value, ...props }: ArraySchemaInputProps): ReactElement {
	return <ArrayInput {...schema} value={isArray(value) ? value : undefined} {...props} />;
}

/**
 * Props for `DictionarySchemaInput`, the [`DictionarySchema`](/schema/DictionarySchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/DictionarySchemaInputProps
 */
export interface DictionarySchemaInputProps extends SchemaInputProps<DictionarySchema<unknown>, unknown> {}

/**
 * Show a [`DictionaryInput`](/ui/DictionaryInput) for a [`DictionarySchema`](/schema/DictionarySchema).
 *
 * @returns A `DictionaryInput` element bound to the schema.
 * @example <DictionarySchemaInput name="meta" schema={META} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/DictionarySchemaInput
 */
export function DictionarySchemaInput({ schema, value, ...props }: DictionarySchemaInputProps): ReactElement {
	return <DictionaryInput {...schema} value={isDictionary(value) ? value : undefined} {...props} />;
}

/**
 * Props for `DataSchemaInput`, the [`DataSchema`](/schema/DataSchema) input variant.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/DataSchemaInputProps
 */
export interface DataSchemaInputProps extends SchemaInputProps<DataSchema<Data>, unknown> {}

/**
 * Show a [`DataInput`](/ui/DataInput) for a nested [`DataSchema`](/schema/DataSchema).
 *
 * @returns A `DataInput` element bound to the schema.
 * @example <DataSchemaInput name="address" schema={ADDRESS} />
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/DataSchemaInput
 */
export function DataSchemaInput({ schema, value, ...props }: DataSchemaInputProps): ReactElement {
	return <DataInput {...schema} value={isData(value) ? value : undefined} {...props} />;
}

/**
 * Props for `SchemaField`: `SchemaInput` props plus optional `children` to override the input.
 *
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/SchemaFieldProps
 */
export interface SchemaFieldProps extends SchemaInputProps<Schema, unknown>, OptionalChildProps {}

/**
 * Show the appropriate input for a schema, wrapped in a [`<Field>`](/ui/Field) with its label and message.
 * - Renders custom `children` inside the field, or a `SchemaInput` when none are provided.
 *
 * @returns A `<Field>` wrapping the schema's input.
 * @example <SchemaField name="email" schema={EMAIL} /> // Outputs a `<Field>` wrapping a `<TextInput>`.
 * @example <SchemaField name="age" schema={AGE} /> // Outputs a `<Field>` wrapping a `<NumberInput>`.
 * @see https://dhoulb.github.io/shelving/ui/form/SchemaInput/SchemaField
 */
export function SchemaField({ schema, children, ...props }: SchemaFieldProps): ReactElement {
	return (
		<Field {...props} {...schema}>
			{children ?? <SchemaInput schema={schema} {...props} />}
		</Field>
	);
}
