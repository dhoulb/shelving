import type { ReactElement, ReactNode } from "react";
import {
	ArraySchema,
	BooleanSchema,
	ChoiceSchema,
	type Data,
	DataSchema,
	DateSchema,
	DictionarySchema,
	getKeys,
	getNumber,
	getSource,
	getString,
	isArray,
	isData,
	isDictionary,
	NullableSchema,
	NumberSchema,
	OptionalSchema,
	requireSource,
	type Schema,
	StringSchema,
	UnexpectedError,
	type ValidatorType,
} from "shelving";
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

/** A schema is required if it's not wrapped in an `OptionalSchema` or `NullableSchema` */
export function isSchemaRequired(schema: Schema): boolean {
	return !(schema instanceof OptionalSchema || schema instanceof NullableSchema);
}

export interface SchemaInputProps<T extends Schema, I = never> extends ValueInputProps<ValidatorType<T>, I> {
	schema: T;
}

/**
 * Show the right control/input for a named property of a form.
 *
 * @example <FormControl name="email" /> // Outputs a `<StringInput>` for the "email" property.
 * @example <FormControl name="age" /> // Outputs a `<NumberInput>` for the "age" property.
 */
export function SchemaInput<T extends Schema>(props: SchemaInputProps<T>): ReactElement;
export function SchemaInput({
	name,
	schema,
	/**
	 * Required defaults to whether the schema is required
	 * - A schema is required if it's not wrapped in an `OptionalSchema` or `NullableSchema`
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

export interface DateSchemaInputProps extends SchemaInputProps<DateSchema, unknown> {}

export function DateSchemaInput({ schema, value, ...props }: DateSchemaInputProps): ReactElement {
	return <DateInput {...schema} value={getString(value)} {...props} />;
}

export interface NumberSchemaInputProps extends SchemaInputProps<NumberSchema, unknown> {}

export function NumberSchemaInput({ schema, value, ...props }: NumberSchemaInputProps): ReactElement {
	return <NumberInput {...schema} value={getNumber(value)} formatter={num => schema.format(num)} {...props} />;
}

export interface ChoiceSchemaInputProps extends SchemaInputProps<ChoiceSchema<string>, unknown> {}

export function ChoiceSchemaInput({ schema, value, ...props }: ChoiceSchemaInputProps): ReactElement {
	const { options } = requireSource(ChoiceSchema, schema);
	if (getKeys(options).length <= 8) return <ChoiceRadioInputs {...schema} value={getString(value)} {...props} />;
	return <SelectInput {...schema} value={getString(value)} {...props} />;
}

export interface BooleanSchemaInputProps extends SchemaInputProps<BooleanSchema, unknown> {}

export function BooleanSchemaInput({ schema, value, ...props }: BooleanSchemaInputProps): ReactElement {
	return <CheckboxInput {...schema} value={!!value} {...props} />;
}

export interface StringSchemaInputProps extends SchemaInputProps<StringSchema, unknown> {}

export function StringSchemaInput({ schema, value, ...props }: StringSchemaInputProps): ReactElement {
	return <TextInput {...schema} value={getString(value)} {...props} />;
}

export interface ArraySchemaInputProps extends SchemaInputProps<ArraySchema<unknown>, unknown> {}

export function ArraySchemaInput({ schema, value, ...props }: ArraySchemaInputProps): ReactElement {
	return <ArrayInput {...schema} value={isArray(value) ? value : undefined} {...props} />;
}

export interface DictionarySchemaInputProps extends SchemaInputProps<DictionarySchema<unknown>, unknown> {}

export function DictionarySchemaInput({ schema, value, ...props }: DictionarySchemaInputProps): ReactElement {
	return <DictionaryInput {...schema} value={isDictionary(value) ? value : undefined} {...props} />;
}

export interface DataSchemaInputProps extends SchemaInputProps<DataSchema<Data>, unknown> {}

export function DataSchemaInput({ schema, value, ...props }: DataSchemaInputProps): ReactElement {
	return <DataInput {...schema} value={isData(value) ? value : undefined} {...props} />;
}

export interface SchemaFieldProps extends SchemaInputProps<Schema, unknown> {
	children?: ReactNode | undefined;
}

/**
 * Show the right control/input for a named property of a form, wrapped in a `<Field>`
 *
 * @example <FormControl name="email" /> // Outputs a `<Field><StringInput></Field>` for the "email" property.
 * @example <FormControl name="age" /> // Outputs a `<Field><NumberInput></Field>` for the "age" property.
 */
export function SchemaField({ schema, children, ...props }: SchemaFieldProps): ReactElement {
	return (
		<Field {...props} {...schema}>
			{children ?? <SchemaInput schema={schema} {...props} />}
		</Field>
	);
}
