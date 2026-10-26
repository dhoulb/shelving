# ArrayInputProps

- Kind: interface
- Import: `import { ArrayInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<ImmutableArray<T>>`

Props for `ArrayInput`, a repeating input that edits an array of schema-validated items.

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
