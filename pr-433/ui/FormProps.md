# FormProps

- Kind: interface
- Import: `import { FormProps } from "shelving/ui";`
- Extends: `BlockVariants`

Props for `Form`, the schema-driven form wrapper component.

## Signatures

```ts
{
	schema: DataSchema<T>;
	data?: PartialData<T> | undefined;
	submit?: ReactNode | undefined;
	onSubmit?: FormCallback<T> | undefined;
	messages?: ImmutableDictionary<string> | string | undefined;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `schema` | `DataSchema<T>` | Schema for the form. |
| `data` | `PartialData<T> \| undefined` | Initial data for the form. Optional. |
| `submit` | `ReactNode \| undefined` | Content of the submit button. Optional. |
| `onSubmit` | `FormCallback<T> \| undefined` | Optional function called when the form is submitted. Takes the current (validated) value of the form, processes it (possibly asynchronously) and returns any new values to set in the form. Optional. |
| `messages` | `ImmutableDictionary<string> \| string \| undefined` | Initial set of messages for the form as either a dictionary or a string with `fieldName:` style messages. Optional. |
