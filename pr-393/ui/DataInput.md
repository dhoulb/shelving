# DataInput

- Kind: component
- Import: `import { DataInput } from "shelving/ui";`

Composite input that edits a data object by rendering a `SchemaInput` for each property schema.
- Each sub-field is keyed by its property name and validated using the matching schema in `props`.

## Signatures

```ts
DataInput(props: DataInputProps<T>): ReactElement
```

## Parameters

| Param | Type | Description |
| --- | --- | --- |
| `props` | `DataInputProps<T>` |  |
| `.props` | `Schemas<T>` | Schema for the sub-fields of this input. |

## Returns

| Type | Description |
| --- | --- |
| `ReactElement` | Element rendering one input per property, laid out in a row or column. |

## Examples

```ts
<DataInput name="address" props={addressSchemas} value={address} onValue={setAddress} />
```
