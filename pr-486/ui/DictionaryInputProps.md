# DictionaryInputProps

- Kind: interface
- Import: `import { DictionaryInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<ImmutableDictionary<T>>`

Props for `DictionaryInput`, a repeating input that edits a dictionary of schema-validated items.

## Signatures

```ts
{
	one?: string;
	many?: string;
	min?: number | undefined;
	max?: number | undefined;
	items: Schema<T>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `one` | `string` | Optional. |
| `many` | `string` | Optional. |
| `min` | `number \| undefined` | Optional. |
| `max` | `number \| undefined` | Optional. |
| `items` | `Schema<T>` | Schema for the items in the repeater. |
