# DataInputProps

- Kind: interface
- Import: `import { DataInputProps } from "shelving/ui";`
- Extends: `ValueInputProps<T>`

Props for `DataInput`, a composite input that edits an object of schema-validated sub-fields.

## Signatures

```ts
{
	props: Schemas<T>;
}
```

## Properties

| Property | Type | Description |
| --- | --- | --- |
| `props` | `Schemas<T>` | Schema for the sub-fields of this input. |
